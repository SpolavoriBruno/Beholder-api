const { getActiveAutomations } = require('./repositories/automationsRepository')
const { getDefaultSettings } = require('./repositories/settingsRepository')
const { MONITOR_TYPES } = require('./repositories/monitorsRepository')
const { INDEX_KEYS } = require('./utils/indexes')
const logger = require('./utils/logger')

const MEMORY = {}
let lockMemory = false
const BRAIN = {}
const BRAIN_INDEX = {}
let lockBrain = false
let lastExecution = {}

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

exports.init = async _ => {
    while (lockBrain);
    const automations = await getActiveAutomations()
    try {
        lockBrain = true
        lockMemory = true

        automations.map(this.updateBrain)

    } finally {
        lockBrain = false
        lockMemory = false
        console.info('Beholder Brain Initialized')
    }
}

exports.updateBrain = automation => {
    if (!automation.isActive || !automation.conditions) return this.deleteBrain(automation)

    BRAIN[automation.id] = automation
    lastExecution[automation.id] = 0
    automation.indexes.split(',').map(index => {
        updateBrainIndex(index, automation.id)
    })
}

const updateBrainIndex = (index, id) => {
    if (!BRAIN_INDEX[index]) BRAIN_INDEX[index] = []
    BRAIN_INDEX[index].push(id)
}

exports.deleteBrain = automation => {
    try {
        lockBrain = true
        delete BRAIN[automation.id]
        deleteBrainIndex(automation.indexes, automation.id)
    } finally {
        lockBrain = false
    }
}

const deleteBrainIndex = (indexes, id) => {
    if (typeof indexes === 'string') indexes = indexes.split(',')
    indexes.forEach(index => {
        if (!BRAIN_INDEX[index] || BRAIN_INDEX[index].length === 0) return
        const pos = BRAIN_INDEX[index].findIndex(i => i === id)
        BRAIN_INDEX[index].splice(pos, 1)
    })
}

exports.deleteMemory = (symbol, index, interval) => {
    const memoryKey = getMemoryKey(symbol, index, interval)
    try {
        lockMemory = true
        delete MEMORY[memoryKey]
    } finally {
        lockMemory = false
    }
    if (LOGS) logger.info(`Beholder Memory Delete - ${memoryKey}`)
}

exports.updateMemory = (symbol, index, interval, value, executeAutomation = true) => {
    while (lockMemory);
    const memoryKey = getMemoryKey(symbol, index, interval)

    MEMORY[memoryKey] = value

    LOGS && logger.info(`Beholder Memory Update - ${memoryKey}`, value)
    executeAutomation && processBrain(memoryKey)
}

const processBrain = memoryKey => {
    while (lockBrain);
    try {
        const automations = findAutomations(memoryKey)
        if (automations.length && !lockBrain) {
            lockBrain = true

            automations.map(evalDecision)
        }
    } finally {
        lockBrain = false
    }
}

// TODO: find a better name
const getAntiRecurrenceState = conditions => {
    const conds = conditions.trim().split(' && ')

    const invertedConds = conds.map(cond => {
        if (cond.indexOf('current') !== -1) {
            if (cond.indexOf('>') !== -1) return cond.replace('>', '<').replace('current', 'previous')
            if (cond.indexOf('<') !== -1) return cond.replace('<', '>').replace('current', 'previous')
            if (cond.indexOf('!=') !== -1) return cond.replace('!=', '==').replace('current', 'previous')
            if (cond.indexOf('==') !== -1) return cond.replace('==', '!=').replace('current', 'previous')
        }
    }).filter(c => c)

    return [conds, invertedConds].flat().join(' && ')
}

const isColdAutomation = automationId => {
    const last = lastExecution[automationId]
    const now = Date.now()
    const diff = now - parseInt(last || 0)

    if (!last) return true
    return diff > BRAIN[automationId].coolDown
}

// TODO: refactor
const evalDecision = automation => {

    const indexes = automation.indexes.split(',')
    const isChecked = indexes.every(index => MEMORY[index] !== null && MEMORY[index] !== undefined)
    if (!isChecked) return false

    const isValid = eval(automation.conditions)
    if (!isValid) return false

    if (!isColdAutomation(automation.id)) return false
    lastExecution[automation.id] = Date.now()


    if (!automation.actions) {
        if (LOGS || automation.logs) logger.info(`Beholder decide to execute, but hasn't actions - ${automation.id}`)
        return false
    }
    const settings = getDefaultSettings(automation.settings)
    // for each action, execute it
}

const findAutomations = memoryKey => {
    const ids = BRAIN_INDEX[memoryKey]
    if (!ids) return []
    return ids.map(id => BRAIN[id])
}

exports.getBrain = _ => ({ ...BRAIN })

exports.getBrainIndexes = _ => ({ ...BRAIN_INDEX })

exports.getMemories = _ => ({ ...MEMORY })

exports.getMemory = (symbol, index, interval) => {
    const memoryKey = getMemoryKey(symbol, index, interval)

    result = MEMORY[memoryKey]
    return typeof result === 'object' ? { ...result } : result
}

exports.getMemoryIndexes = _ =>
    Object.entries(flattenObject(MEMORY)).map(prop => {
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
    })

