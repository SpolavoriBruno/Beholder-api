const orderTemplateModel = require('../models/orderTemplateModel')
const Sequelize = require('sequelize')

const PAGE_SIZE = 10

const orderTemplateExists = (name, symbol) => orderTemplateModel.findOne({ where: { name, symbol } })

exports.insertOrderTemplate = orderTemplate =>
    orderTemplateExists(orderTemplate.name, orderTemplate.symbol).then(exist => {
        if (exist) return Promise.reject({ status: 400, message: 'Order template already exists' })
        return orderTemplateModel.create(orderTemplate)
    }).catch(error => logger.error(error))

exports.deleteOrderTemplate = id => orderTemplateModel.destroy({ where: { id } })

exports.getOrderTemplates = (symbol, page = 1) => {
    const options = {
        where: {},
        orderTemplate: [['updatedAt', 'DESC']],
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

    return orderTemplateModel.findAndCountAll(options)
}

exports.getOrderTemplate = id => orderTemplateModel.findOne({ where: { id } })

exports.updateOrderTemplate = async (id, newOrderTemplate) => {
    const currentOrderTemplate = await this.getOrderTemplate(id)

    if (newOrderTemplate.name && newOrderTemplate.name !== currentOrderTemplate.name)
        currentOrderTemplate.name = newOrderTemplate.name

    if (newOrderTemplate.type && newOrderTemplate.type !== currentOrderTemplate.type)
        currentOrderTemplate.type = newOrderTemplate.type

    if (newOrderTemplate.side && newOrderTemplate.side !== currentOrderTemplate.side)
        currentOrderTemplate.side = newOrderTemplate.side

    if (newOrderTemplate.limitPrice && newOrderTemplate.limitPrice !== currentOrderTemplate.limitPrice)
        currentOrderTemplate.limitPrice = newOrderTemplate.limitPrice

    if (newOrderTemplate.limitPriceMultiplier && newOrderTemplate.limitPriceMultiplier !== currentOrderTemplate.limitPriceMultiplier)
        currentOrderTemplate.limitPriceMultiplier = newOrderTemplate.limitPriceMultiplier

    if (newOrderTemplate.stopPrice && newOrderTemplate.stopPrice !== currentOrderTemplate.stopPrice)
        currentOrderTemplate.stopPrice = newOrderTemplate.stopPrice

    if (newOrderTemplate.stopPriceMultiplier && newOrderTemplate.stopPriceMultiplier !== currentOrderTemplate.stopPriceMultiplier)
        currentOrderTemplate.stopPriceMultiplier = newOrderTemplate.stopPriceMultiplier

    if (newOrderTemplate.quantity && newOrderTemplate.quantity !== currentOrderTemplate.quantity)
        currentOrderTemplate.quantity = newOrderTemplate.quantity

    if (newOrderTemplate.quantityMultiplier && newOrderTemplate.quantityMultiplier !== currentOrderTemplate.quantityMultiplier)
        currentOrderTemplate.quantityMultiplier = newOrderTemplate.quantityMultiplier

    if (newOrderTemplate.icebergQty && newOrderTemplate.icebergQty !== currentOrderTemplate.icebergQty)
        currentOrderTemplate.icebergQty = newOrderTemplate.icebergQty

    if (newOrderTemplate.icebergQtyMultiplier && newOrderTemplate.icebergQtyMultiplier !== currentOrderTemplate.icebergQtyMultiplier)
        currentOrderTemplate.icebergQtyMultiplier = newOrderTemplate.icebergQtyMultiplier

    if (newOrderTemplate.isMaker !== undefined && newOrderTemplate.isMaker !== currentOrderTemplate.isMaker)
        currentOrderTemplate.isMaker = newOrderTemplate.isMaker

    await currentOrderTemplate.save()
    return currentOrderTemplate
}

