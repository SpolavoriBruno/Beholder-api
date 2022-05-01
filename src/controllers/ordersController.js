const { getOrders, insertOrder, updateOrderByOrderId, getOrderById } = require('../repositories/ordersRepository')
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
        res.status(400).json(error.body)
        console.error(error)
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
        console.error(error)
        return res.status(400).json(error.body)
    }

    const { status } = result || {}

    const order = await updateOrderByOrderId(result.orderId, result.origClientOrderId, {
        status
    })

    res.json(order.get({ plain: true }))
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
        console.error(error)
        return res.sendStatus(404)
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
