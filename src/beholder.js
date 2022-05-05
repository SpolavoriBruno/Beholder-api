const logger = require('./utils/logger')
const { MONITOR_TYPES } = require('./repositories/monitorsRepository')
const { INDEX_KEYS } = require('./utils/indexes')

const MEMORY = {}
let lockMemory = false
const BRAIN = {}
let lockBrain = false

const LOGS = process.env.BEHOLDER_LOGS === 'true'

function getMemoryKey(symbol, index, interval) {
    const indexKey = interval ? `${index}_${interval}` : index
    return `${symbol}:${indexKey}`
}

exports.INDEX_KEYS = {
    ...MONITOR_TYPES,
    ...INDEX_KEYS
}

exports.init = (automations) => {
    while (lockBrain);
    // Load brain
}

exports.deleteMemory = (symbol, index, interval) => {
    const memoryKey = getMemoryKey(symbol, index, interval)
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
    const memoryKey = getMemoryKey(symbol, index, interval)

    MEMORY[memoryKey] = value

    if (LOGS) logger.info(`Beholder Memory Update - ${memoryKey}`, value)
}

exports.getBrain = () => ({ ...BRAIN })
exports.getMemory = (symbol, index, interval) => {
    if (symbol && index) {
        const memoryKey = getMemoryKey(symbol, index, interval)

        result = MEMORY[memoryKey]
        return typeof result === 'object' ? { ...result } : result
    }
    return { ...MEMORY }
}
