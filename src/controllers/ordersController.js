const { getOrders, insertOrder } = require('../repositories/ordersRepository')

exports.getOrders = async (req, res, next) => {
    const symbol = req.params.symbol && req.params.symbol.toUpperCase()
    const page = parseInt(req.query.page) || 1
    const orders = await getOrders(symbol, page)

    res.json(orders)
}

exports.placeOrder = async (req, res, next) => {
    const { side, symbol, quantity, price, type, options, automationId } = req.body
    const order = await insertOrder({
        side, symbol, quantity, type, options, automationId,
        limitPrice: price,
        stopPrice: options?.stopPrice || null,
        icebergQuantity: options?.icebergQuantity || null,
        orderId: 1,
        clientOrderId: "a",
        transactTime: Date.now(),
        status: "null"
    })

    try {
        res.status(201).json(order.get({ plain: true }))
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

exports.cancelOrder = async (req, res, next) => {
    res.sendStatus(200)
}
