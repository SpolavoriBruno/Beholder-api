const Sequelize = require('sequelize')
const monitorModel = require('../models/monitorModel')
const PAGE_SIZE = 10

exports.MONITOR_TYPES = {
    MINI_TICKER: 'MINI_TICKER',
    BOOK: 'BOOK',
    USER_DATA: 'USER_DATA',
    CANDLES: 'CANDLES',
    WALLET: 'WALLET',
    LAST_ORDER: 'LAST_ORDER',
    LAST_CANDLE: 'LAST_CANDLE',
}

exports.insertMonitor = async newMonitor => {
    newMonitor.interval = newMonitor.interval || null

    const alreadyExists = await this.monitorExists(newMonitor.type, newMonitor.symbol, newMonitor.interval)
    if (alreadyExists)
        return Promise.reject({ status: 409, body: 'Monitor already exists' })

    return monitorModel.create(newMonitor)
}

exports.deleteMonitor = id => monitorModel.destroy({ where: { id, isSystemMon: false } })

exports.getMonitor = id => monitorModel.findByPk(id)

exports.getMonitors = (page = 1) => monitorModel.findAndCountAll({
    where: {},
    order: [['isActive', 'DESC'], ['isSystemMon', 'DESC'], ['symbol', 'ASC']],
    limit: PAGE_SIZE,
    offset: PAGE_SIZE * (page - 1)
})

exports.getActiveMonitors = _ => monitorModel.findAll({ where: { isActive: true } })

exports.monitorExists = async (type, symbol, interval) => {
    const count = await monitorModel.count({ where: { type, symbol, interval } })
    return count > 0
}


exports.updateMonitor = async (id, newMonitor) => {
    const currentMonitor = await this.getMonitor(id)

    if (currentMonitor.type === this.MONITOR_TYPES.CANDLES) {
        if (newMonitor.interval && newMonitor.interval !== currentMonitor.interval)
            currentMonitor.interval = newMonitor.interval
    }
    else currentMonitor.interval = null

    if (newMonitor.symbol && newMonitor.symbol !== currentMonitor.symbol)
        currentMonitor.symbol = newMonitor.symbol

    if (newMonitor.type && newMonitor.type !== currentMonitor.type)
        currentMonitor.type = newMonitor.type

    if (newMonitor.broadcastLabel !== currentMonitor.broadcastLabel)
        currentMonitor.broadcastLabel = newMonitor.broadcastLabel

    if (newMonitor.indexes !== currentMonitor.indexes)
        currentMonitor.indexes = newMonitor.indexes

    if (newMonitor.isActive !== undefined && newMonitor.isActive !== currentMonitor.isActive)
        currentMonitor.isActive = newMonitor.isActive

    if (newMonitor.isSystemMon !== undefined && newMonitor.isSystemMon !== currentMonitor.isSystemMon)
        currentMonitor.isSystemMon = newMonitor.isSystemMon

    if (newMonitor.logs !== undefined && newMonitor.logs !== currentMonitor.logs)
        currentMonitor.logs = newMonitor.logs

    await currentMonitor.save()
    return currentMonitor
}

