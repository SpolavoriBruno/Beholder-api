const logger = require('./utils/logger')
const { MONITOR_TYPES } = require('./repositories/monitorsRepository')
const { INDEX_KEYS } = require('./utils/indexes')

const MEMORY = {}

const BRAIN = {}

const LOGS = process.env.BEHOLDER_LOGS === 'true'

exports.INDEX_KEYS = {
    ...MONITOR_TYPES,
    ...INDEX_KEYS
}

exports.init = (automations) => {
    // Load brain


}

exports.updateMemory = (symbol, index, interval, value) => {
    const indexKey = interval ? `${index}_${interval}` : index
    const memoryKey = `${symbol}:${indexKey}`

    MEMORY[memoryKey] = value

    if (LOGS) logger.info(`Beholder Memory Update - ${memoryKey}`, value)
}

exports.getMemory = () => ({ ...MEMORY })
exports.getBrain = () => ({ ...MEMORY })
