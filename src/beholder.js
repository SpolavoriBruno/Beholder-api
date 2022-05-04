const logger = require('./utils/logger')
const { MONITOR_TYPES } = require('./repositories/monitorsRepository')
const { INDEX_KEYS } = require('./utils/indexes')

const MEMORY = {}
let lockMemory = false
const BRAIN = {}
let lockBrain = false

const LOGS = process.env.BEHOLDER_LOGS === 'true'

exports.INDEX_KEYS = {
    ...MONITOR_TYPES,
    ...INDEX_KEYS
}

exports.init = (automations) => {
    while (lockBrain);
    // Load brain
}

exports.deleteMemory = (symbol, index, interval) => {
    const indexKey = interval ? `${index}_${interval}` : index
    const memoryKey = `${symbol}:${indexKey}`
    try {
        lockMemory = true
        delete MEMORY[memoryKey]
    } finally {
        lockMemory = false
    }
    if (LOGS || true) logger.info(`Beholder Memory Delete - ${memoryKey}`)
}

exports.updateMemory = (symbol, index, interval, value) => {
    while (lockMemory);
    const indexKey = interval ? `${index}_${interval}` : index
    const memoryKey = `${symbol}:${indexKey}`

    MEMORY[memoryKey] = value

    if (LOGS) logger.info(`Beholder Memory Update - ${memoryKey}`, value)
}

exports.getMemory = () => ({ ...MEMORY })
exports.getBrain = () => ({ ...MEMORY })
