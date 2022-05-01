const { getOrders, insertOrder, updateOrderByOrderId } = require('../repositories/ordersRepository')
const { getDecryptedSettings } = require('../repositories/settingsRepository')

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
