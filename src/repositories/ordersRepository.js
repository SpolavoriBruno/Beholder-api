const orderModel = require('../models/orderModel')
const Sequelize = require('sequelize')

const PAGE_SIZE = 10

exports.insertOrder = newOrder => {
    return orderModel.create(newOrder)
}

exports.getOrders = (symbol, page = 1) => {
    const options = {
        where: {},
        order: [['updatedAt', 'DESC']],
        limit: PAGE_SIZE,
        offset: PAGE_SIZE * (page - 1)
    }

    if (symbol) {
        if (symbol.length < 6)
            options.where.symbol = {
                [Sequelize.Op.like]: `%${symbol}%`
            }
        else
            options.where = { symbol }
    }

    return orderModel.findAndCountAll(options)
}

exports.getOrderById = id => {
    return orderModel.findByPk(id)
}

exports.getOrder = (orderId, clientOrderId) => {
    return orderModel.findOne({
        where: {
            orderId,
            clientOrderId
        }
    })
}

exports.updateOrderById = async (id, newOrder) => {
    const order = await this.getOrderById(id)
    return updateOrder(order, newOrder)
}

exports.updateOrderByOrderId = async (orderId, clientOrderId, newOrder) => {
    const order = await this.getOrder(orderId, clientOrderId)
    return updateOrder(order, newOrder)
}

const updateOrder = async (currentOrder, newOrder) => {
    if (newOrder.status && newOrder.status !== currentOrder.status)
        currentOrder.status = newOrder.status

    if (newOrder.avgPrive && newOrder.avgPrive !== currentOrder.avgPrive)
        currentOrder.avgPrive = newOrder.avgPrive

    if (newOrder.obs && newOrder.obs !== currentOrder.obs)
        currentOrder.obs = newOrder.obs

    if (newOrder.trasactTime)
        currentOrder.trasactTime = newOrder.trasactTime

    if (newOrder.commission)
        currentOrder.commission = newOrder.commission

    if (newOrder.net)
        currentOrder.net = newOrder.net

    if (newOrder.isMaker !== undefined && newOrder.isMaker !== currentOrder.isMaker)
        currentOrder.isMaker = newOrder.isMaker

    await currentOrder.save()
    return currentOrder
}
