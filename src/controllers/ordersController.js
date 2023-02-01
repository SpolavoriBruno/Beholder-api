const { getMemory } = require('../beholder')
const { getOrders, insertOrder, updateOrderByOrderId, getOrderById, getReportOrders } = require('../repositories/ordersRepository')
const { getDecryptedSettings } = require('../repositories/settingsRepository')
const { ORDER_STATUS } = require('../utils/status')
const { sleep } = require('../utils/time')

const MS_IN_DAY = 24 * 60 * 60 * 1000
const MS_IN_HOUR = 60 * 60 * 1000

exports.getOrders = async (req, res) => {
    const symbol = req.params.symbol && req.params.symbol.toUpperCase()
    const page = parseInt(req.query.page) || 1
    const orders = await getOrders(symbol, page)

    res.json(orders)
}

exports.placeOrder = async (req, res) => {
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
        console.error(error)
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

exports.cancelOrder = async (req, res) => {
    const token = res.locals.token.id
    const settings = await getDecryptedSettings(token)
    const exchange = require('../utils/exchange')(settings)

    const { symbol, orderId } = req.params
    let result

    try {
        result = await exchange.cancel(symbol, orderId)
    } catch (error) {
        console.error(error())
        return res.status(400).send(error.body)
    }

    const { status } = result || {}

    const order = await updateOrderByOrderId(result.orderId, result.origClientOrderId, {
        status
    })

    res.json(order.get)
}

function getThirtyDaysAgo() {
    const date = new Date()
    date.setUTCDate(date.getUTCDate() - 30)
    date.setUTCHours(0, 0, 0, 0)
    return date.getTime()
}

function getToday() {
    const date = new Date()
    date.setUTCHours(23, 59, 59, 999)
    return date.getTime()
}

function getStartToday() {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    return date.getTime();
}

function groupByAutomations(orders) {
    const automationsObj = {}
    orders.forEach(order => {
        const automationId = order.automationId ?? 'M'

        if (!automationsObj[automationId]) {
            automationsObj[automationId] = {
                name: order.automationId ? order['automation.name'] : "Others",
                executions: 1,
                net: 0,
            }
        } else
            automationsObj[automationId].executions++

        if (order.side === 'BUY')
            automationsObj[automationId].net -= parseFloat(order.net)
        else
            automationsObj[automationId].net += parseFloat(order.net)
    })

    return Object.entries(automationsObj)
        .map(a => a[1])
        .sort((a, b) => b.net - a.net)
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

exports.getMonthReport = async (req, res) => {
    const quote = req.params.quote
    const startDate = parseInt(req.query.startDate) || getThirtyDaysAgo()
    let endDate = parseInt(req.query.endDate) || getToday()

    if (endDate - startDate > (90 * MS_IN_DAY))
        endDate = startDate + (90 * MS_IN_DAY)

    getReportOrders(quote, startDate, endDate)
        .then(orders => {
            if (!orders || !orders.length) return res.json({})

            const daysInRange = Math.ceil((endDate - startDate) / MS_IN_DAY)

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
            const automations = groupByAutomations(orders)

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
                automations
            })
        }).catch(console.error)
}

exports.getDayTradeReport = (req, res) => {

    const quote = req.params.quote

    let startDate = req.query.date ? parseInt(req.query.date) : getStartToday();
    const endDate = startDate + MS_IN_DAY - 1

    if ((endDate - startDate) > (MS_IN_DAY)) startDate = getStartToday();
    getReportOrders(quote, startDate, endDate)
        .then(orders => {
            if (!orders || !orders.length) return res.json({})

            const subs = []
            const series = []
            for (let i = 0; i < 24; i++) {
                const newDate = new Date(startDate)
                newDate.setUTCHours(i)
                subs.push(`${i}h`)

                const lastDate = newDate.getTime() + MS_IN_HOUR - 1

                const partialBuy = calcVolume(orders, 'BUY', newDate.getTime(), lastDate)
                const partialSell = calcVolume(orders, 'SELL', newDate.getTime(), lastDate)

                series.push(partialSell - partialBuy)
            }

            const buyVolume = calcVolume(orders, 'BUY')
            const sellVolume = calcVolume(orders, 'SELL')
            const profit = sellVolume - buyVolume

            const wallet = getMemory(quote, 'WALLET')
            const profitPerc = profit * 100 / (parseFloat(wallet) - profit)
            const automations = groupByAutomations(orders)

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
                automations
            })
        }).catch(console.error)
}

exports.getOrdersReport = (req, res) => {
    if (req.query.date)
        return this.getDayTradeReport(req, res)
    else
        return this.getMonthReport(req, res)
}

exports.syncOrder = async (req, res) => {
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
        console.error(error())
        return res.status(404).send(error.body)
    }

    const quoteQuantity = parseFloat(binanceOrder.cummulativeQuoteQty)
    order.avg = quoteQuantity / parseFloat(binanceOrder.executedQty)
    order.isMaker = binanceTrade.isMaker
    order.commission = binanceTrade.commission
    order.quantity = binanceOrder.executedQty;

    const isQuoteCommission = binanceTrade.commissionAsset && order.symbol.endsWith(binanceTrade.commissionAsset)
    order.net = isQuoteCommission
        ? quoteQuantity - parseFloat(binanceTrade.commission)
        : quoteQuantity

    await order.save()
    return res.json(order)
}
