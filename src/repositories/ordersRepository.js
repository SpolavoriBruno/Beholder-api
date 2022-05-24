const orderModel = require('../models/orderModel')
const automationModel = require('../models/automationModel')
const Sequelize = require('sequelize')

const PAGE_SIZE = 10

exports.insertOrder = newOrder => orderModel.create(newOrder)

exports.getReportOrders = (quoteAsset, startDate, endDate) => {
    startDate = startDate || 0
    endDate = endDate || Date.now()
    return orderModel.findAll({
        where: {
            symbol: { [Sequelize.Op.like]: `%${quoteAsset}` },
            transactTime: { [Sequelize.Op.between]: [startDate, endDate] },
            status: 'FILLED',
            net: { [Sequelize.Op.gt]: 0 }
        },
        order: [['transactTime', 'ASC']],
        include: automationModel,
        raw: true
    })
}

exports.getOrders = (symbol, page = 1) => {
    const options = {
        where: {},
        include: automationModel,
        order: [['updatedAt', 'DESC']],
        limit: PAGE_SIZE,
        offset: PAGE_SIZE * (page - 1)
    }

    if (symbol) {
        if (symbol.length < 6)
            options.where.symbol = {
                [Sequelize.Op.like]: `%${symbol}%`
            }
        else options.where = { symbol }
    }

    return orderModel.findAndCountAll(options)
}

exports.getOrderById = id => orderModel.findByPk(id)


exports.getOrder = (orderId, clientOrderId) => orderModel.findOne({
    where: {
        orderId,
        clientOrderId
    },
    include: automationModel,
})

exports.getLastFilledOrders = _ => orderModel.findAll({
    where: { status: 'FILLED' },
    group: 'symbol',
    attributes: [Sequelize.fn('max', Sequelize.col('id'))],
    raw: true
})
    .then(orders => orders.map(res => res.max))
    .then(ids => orderModel.findAll({
        where: { id: ids },
        raw: true
    }))

exports.updateOrderById = async (id, newOrder) => {
    const order = await this.getOrderById(id)
    return updateOrder(order, newOrder)
}

exports.updateOrderByOrderId = async (orderId, clientOrderId, newOrder) => {
    const order = await this.getOrder(orderId, clientOrderId)
    return updateOrder(order, newOrder)
}

exports.LIMIT_TYPES = ["LIMIT", "STOP_LOSS_LIMIT", "TAKE_PROFIT_LIMIT"]
exports.STOP_TYPES = ["STOP_LOSS", "STOP_LOSS_LIMIT", "TAKE_PROFIT", "TAKE_PROFIT_LIMIT"]


const updateOrder = async (currentOrder, newOrder) => {
    if (newOrder.status && newOrder.status !== currentOrder.status)
        currentOrder.status = newOrder.status

    if (newOrder.avgPrice && newOrder.avgPrice !== currentOrder.avgPrice)
        currentOrder.avgPrice = newOrder.avgPrice

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
    return currentOrder.get({ plain: true })
}
