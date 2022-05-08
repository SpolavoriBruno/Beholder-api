const monitorModel = require('../models/monitorModel')
const PAGE_SIZE = 10

// User can create/manipulate this monitors
const USER_MONITOR_TYPES = {
    TICKER: 'TICKER',
    MINI_TICKER: 'MINI_TICKER',
    CANDLES: 'CANDLES',
}

// System monitors & user monitors
exports.MONITOR_TYPES = {
    USER_DATA: 'USER_DATA',
    BOOK: 'BOOK',
    ...USER_MONITOR_TYPES,
}

exports.getMonitorTypes = _ => {
    return new Promise((resolve, reject) => {
        const userMonitorTypesArray = Object.keys(USER_MONITOR_TYPES)
        const monitorTypesArray = Object.values(this.MONITOR_TYPES)

        resolve(
            monitorTypesArray.map(type => ({
                type,
                systemOnly: !userMonitorTypesArray.includes(type),
                default: type === this.MONITOR_TYPES.CANDLES,
            }))
        )
    })
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

