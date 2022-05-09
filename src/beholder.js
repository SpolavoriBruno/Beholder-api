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

function getEval(prop) {
    if (!prop.includes('.')) return `MEMORY['${prop}']`

    const propSplit = prop.split('.')
    const memoryKey = propSplit[0]
    const memoryProp = prop.replace(`${memoryKey}`, '')

    return `MEMORY['${memoryKey}']${memoryProp}`
}

function flattenObject(obj) {
    let result = {}

    for (let i in obj) {
        if (!obj.hasOwnProperty(i)) continue

        if ((typeof obj[i]) === 'object' && obj[i] !== null) {
            const flatObject = flattenObject(obj[i])
            for (let j in flatObject) {
                if (!flatObject.hasOwnProperty(j)) continue
                result[`${i}.${j}`] = flatObject[j]
            }
        } else {
            result[i] = obj[i]
        }
    }
    return result
}

exports.MEMORY_KEYS = {
    WALLET: 'WALLET',
    LAST_ORDER: 'LAST_ORDER',
    LAST_CANDLE: 'LAST_CANDLE',
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

exports.getBrain = _ => ({ ...BRAIN })
exports.getMemories = _ => ({ ...MEMORY })

exports.getMemory = (symbol, index, interval) => {
    const memoryKey = getMemoryKey(symbol, index, interval)

    result = MEMORY[memoryKey]
    return typeof result === 'object' ? { ...result } : result
}

exports.getMemoryIndexes = (symbol, index, interval) => {
    return Object.entries(flattenObject(MEMORY)).map(prop => {
        const propSplit = prop[0].split(':')
        return {
            symbol: propSplit[0],
            variable: propSplit[1],
            eval: getEval(prop[0]),
            example: prop[1]
        }
    }).sort((a, b) => {
        if (a.variable < b.variable) return -1
        if (a.variable > b.variable) return 1
        return 0
    }).filter(item => {
        console.log('exist symbol', !!symbol)
        if (symbol) return item.symbol === symbol
        return true
    })
}
