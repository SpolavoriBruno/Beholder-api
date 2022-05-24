const { getMemory } = require('../beholder')
const { getOrders, insertOrder, updateOrderByOrderId, getOrderById, getReportOrders } = require('../repositories/ordersRepository')
const { getDecryptedSettings } = require('../repositories/settingsRepository')
const { ORDER_STATUS } = require('../utils/status')

exports.getOrders = async (req, res, next) => {
    const symbol = req.params.symbol && req.params.symbol.toUpperCase()
    const page = parseInt(req.query.page) || 1
    const orders = await getOrders(symbol, page)

    res.json(orders)
}

exports.placeOrder = async (req, res, next) => {
    const id = res.locals.token.id
    const settings = await getDecryptedSettings(id)
    const exchange = require('../utils/exchange')(settings)

    const { side, symbol, quantity, price, type, options, automationId } = req.body

    let result

    try {
        if (side === 'BUY')
            result = await exchange.buy(symbol, quantity, price, options)
        else
            result = await exchange.sell(symbol, quantity, price, options)
    } catch (error) {
        console.error(error.toJSON())
        return res.status(400).send(error.body)
    }

    const { orderId, clientOrderId, transactTime, status } = result || {}

    const order = await insertOrder({
        side, symbol, quantity, type, options, automationId,
        orderId, clientOrderId, transactTime, status,
        limitPrice: price,
        stopPrice: options?.stopPrice || null,
        icebergQuantity: options?.icebergQuantity || null,
    })

    res.status(201).json(order.get({ plain: true }))
}

exports.cancelOrder = async (req, res, next) => {
    const token = res.locals.token.id
    const settings = await getDecryptedSettings(token)
    const exchange = require('../utils/exchange')(settings)

    const { symbol, orderId } = req.params
    let result

    try {
        result = await exchange.cancel(symbol, orderId)
    } catch (error) {
        console.error(error.toJSON())
        return res.status(400).send(error.body)
    }

    const { status } = result || {}

    const order = await updateOrderByOrderId(result.orderId, result.origClientOrderId, {
        status
    })

    res.json(order.get({ plain: true }))
}

function getThirtyDaysAgo() {
    const date = new Date()
    date.setUTCDate(date.getUTCDate() - 30)
    date.setUTCHours(0, 0, 0, 0)
    return date.getTime()
}

function getToday() {
    const date = new Date()
    return date.getTime()
}

function calcVolume(orders, side, startTime, endTime) {
    startTime = startTime || 0
    endTime = endTime || Date.now()

    const filteredOrders = orders.filter(o =>
        o.transactTime >= startTime &&
        o.transactTime <= endTime &&
        o.side === side
    )
    if (!filteredOrders.length) return 0

    return filteredOrders
        .map(o => parseFloat(o.net))
        .reduce((a, b) => a + b)
}

exports.getOrdersReport = async (req, res) => {
    const quote = req.params.quote
    const startDate = parseInt(req.query.startDate) || getThirtyDaysAgo()
    const endDate = parseInt(req.query.endDate) || getToday()

    if (endDate - startDate > (90 * 24 * 60 * 60 * 1000)) {
        return res.status(400).send('Date range too large')
    }

    getReportOrders(quote, startDate, endDate)
        .then(orders => {
            if (!orders || !orders.length) return res.json({})

            const daysInRange = Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000))

            const subs = []
            const series = []
            for (let i = 0; i < daysInRange; i++) {
                const newDate = new Date(startDate)
                newDate.setUTCDate(newDate.getUTCDate() + i)
                subs.push(`${newDate.getDate()}/${newDate.getMonth() + 1}`)

                const lastMoment = new Date(newDate.getTime())
                lastMoment.setUTCHours(23, 59, 59, 999)

                const partialBuy = calcVolume(orders, 'BUY', newDate.getTime(), lastMoment.getTime())
                const partialSell = calcVolume(orders, 'SELL', newDate.getTime(), lastMoment.getTime())

                series.push(partialSell - partialBuy)
            }
            const buyVolume = calcVolume(orders, 'BUY')
            const sellVolume = calcVolume(orders, 'SELL')
            const profit = sellVolume - buyVolume

            const wallet = getMemory(quote, 'WALLET')
            const profitPerc = profit * 100 / (parseFloat(wallet) - profit)

            res.json({
                quote,
                orders: orders.length,
                buyVolume,
                sellVolume,
                wallet,
                profit,
                profitPerc,
                startDate,
                endDate,
                subs,
                series,
            })
        })
}

exports.syncOrder = async (req, res, next) => {
    const id = res.locals.token.id
    const settings = await getDecryptedSettings(id)
    const exchange = require('../utils/exchange')(settings)

    const beholderOrderId = req.params.id
    const order = await getOrderById(beholderOrderId)
    if (!order) return res.sendStatus(404)

    let binanceOrder, binanceTrade

    try {
        binanceOrder = await exchange.orderStatus(order.symbol, order.orderId)
        order.status = binanceOrder.status
        order.transactTime = binanceOrder.updateTime

        if (binanceOrder.status !== ORDER_STATUS.FILLED) {
            await order.save()
            return res.json(order.get({ plain: true }))
        }

        binanceTrade = await exchange.orderTrade(order.symbol, order.orderId)
    } catch (error) {
        console.error(error.toJSON())
        return res.status(404).send(error.body)
    }

    const quoteQuantity = parseFloat(binanceOrder.cummulativeQuoteQty)
    order.avg = quoteQuantity / parseFloat(binanceOrder.executedQty)
    order.isMaker = binanceTrade.isMaker
    order.commission = binanceTrade.commission

    const isQuoteCommission = binanceTrade.commissionAsset && order.symbol.endsWith(binanceTrade.commissionAsset)
    order.net = isQuoteCommission
        ? quoteQuantity - parseFloat(binanceTrade.commission)
        : quoteQuantity

    await order.save()
    return res.json(order)

}
