const automationModel = require('../models/automationModel')

const PAGE_SIZE = 10

exports.getActiveAutomations = _ => automationModel.findAll({ where: { isActive: true } })

exports.getAutomation = id => automationModel.findByPk(id)

exports.getAutomations = (page = 1) => automationModel.findAndCountAll({
    where: {},
    order: [['isActive', 'DESC'], ['symbol', 'ASC'], ['name', 'ASC']],
    limit: PAGE_SIZE,
    offset: PAGE_SIZE * (page - 1)
})

exports.insertAutomation = async newAutomation => {

    const alreadyExists = await this.automationExists(newAutomation.name, newAutomation.symbol)
    if (alreadyExists)
        return Promise.reject({ status: 409, body: 'Automation already exists' })

    return automationModel.create(newAutomation)
}

exports.automationExists = async (name, symbol) => {
    const count = await automationModel.count({ where: { name, symbol } })
    return count > 0
}

exports.deleteAutomation = id => automationModel.destroy({ where: { id } })

exports.updateAutomation = async (id, newAutomation) => {
    const currentAutomation = await this.getAutomation(id)

    if (newAutomation.symbol && newAutomation.symbol !== currentAutomation.symbol)
        currentAutomation.symbol = newAutomation.symbol

    if (newAutomation.name && newAutomation.name !== currentAutomation.name)
        currentAutomation.name = newAutomation.name

    if (newAutomation.indexes && newAutomation.indexes !== currentAutomation.indexes)
        currentAutomation.indexes = newAutomation.indexes

    if (newAutomation.conditions && newAutomation.conditions !== currentAutomation.conditions)
        currentAutomation.conditions = newAutomation.conditions

    if (newAutomation.isActive !== undefined && newAutomation.isActive !== currentAutomation.isActive)
        currentAutomation.isActive = newAutomation.isActive

    if (newAutomation.logs !== undefined && newAutomation.logs !== currentAutomation.logs)
        currentAutomation.logs = newAutomation.logs

    await currentAutomation.save()
    return currentAutomation
}

