const { getActiveAutomations } = require('./repositories/automationsRepository')
const { getDefaultSettings } = require('./repositories/settingsRepository')
const { MONITOR_TYPES } = require('./repositories/monitorsRepository')
const { doAction } = require('./controllers/actionController')
const { INDEX_KEYS } = require('./utils/indexes')
const logger = require('./utils/logger')
const { sleep } = require('./utils/time')

const MEMORY = {}
const BRAIN = {}
const BRAIN_INDEX = {}
let lastExecution = {}
let lockMemory = false
let lockBrain = false

const LOGS = process.env.BEHOLDER_LOGS === 'true'

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
    const automations = await getActiveAutomations()
    await sleep(2500)
    try {
        while (lockBrain) await sleep(100)
        lockBrain = true
        lockMemory = true

        automations.map(this.updateBrain)

    } finally {
        lockBrain = false
        lockMemory = false
        logger.info('Beholder Brain Initialized')
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

exports.deleteBrain = async automation => {
    try {
        while (lockBrain) await sleep(100)
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
    if (MEMORY[memoryKey] === undefined) return

    try {
        lockMemory = true
        delete MEMORY[memoryKey]
    } finally {
        lockMemory = false
    }
    if (LOGS) logger.info(`Beholder Memory Delete - ${memoryKey}`)
}

exports.updateMemory = async ({ symbol, index, interval, value, process = true }, cb) => {
    while (lockMemory) await sleep(100)
    const memoryKey = getMemoryKey(symbol, index, interval)

    MEMORY[memoryKey] = value

    LOGS && logger.info(`Beholder Memory Update - ${memoryKey}`, value)
    if (process) processBrain(memoryKey, cb)
}

const processBrain = async (memoryKey, cb) => {
    try {
        const automations = findAutomations(memoryKey)
        if (!automations || !automations.length) return
        LOGS && logger.info(`Beholder Brain will test ${automations.length} auto for ${memoryKey}`)

        while (lockBrain) await sleep(100)
        lockBrain = true
        automations.map(auto => evalDecision(auto, cb))
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
const evalDecision = (automation, cb) => {
    if (!automation) return
    const indexes = automation.indexes ? automation.indexes.split(',') : []
    const isChecked = indexes.every(index => MEMORY[index] !== null && MEMORY[index] !== undefined)
    if (!isChecked) return

    const isValid = eval(automation.conditions)
    if (!isValid) return

    if (!isColdAutomation(automation.id)) return
    lastExecution[automation.id] = Date.now()

    if (!automation.actions || !automation.actions.length) {
        if (LOGS || automation.logs) logger.info(`Beholder decide to execute, but hasn't actions - ${automation.id}`)
        return
    }
    if (LOGS || automation.logs) logger.info(`Beholder decide to execute - ${automation.id}`)
    getDefaultSettings().then(settings => {
        automation.actions.map(async action => {
            const result = await doAction(settings, action, automation, this)
            if (result && typeof cb === 'function') cb(result)
            if (automation.logs) logger.info(`Automation ${automation.name} executed at ${new Date().toISOString()}`)
        })
    })
}

const findAutomations = memoryKey => {
    const ids = BRAIN_INDEX[memoryKey]
    if (!ids) return []
    return [...new Set(ids)].map(id => BRAIN[id])
}

exports.getBrain = _ => ({ ...BRAIN })

exports.getBrainIndexes = _ => ({ ...BRAIN_INDEX })

exports.getMemories = _ => ({ ...MEMORY })

const getMemoryKey = (symbol, index, interval) => {
    const indexKey = interval ? `${index}_${interval}` : index
    return `${symbol}:${indexKey}`
}

exports.getMemory = (...params) => {
    let result

    switch (params.length) {
        case 1:
            if (typeof params[0] === 'string' && params[0].includes('MEMORY')) {
                result = eval(params[0])
            } else if (typeof params[0] === 'string' && params[0].includes('.')) {
                result = eval(getEval(params[0]))
            } else result = MEMORY[params[0]]
            break;

        case 2: case 3:
            result = MEMORY[getMemoryKey(...params)]
            break;

        case 4:
            if (params[3].includes('.')) {
                const p = params[3].split('.')
                result = MEMORY[getMemoryKey(...params)][p[0]][p[1]]
            } else
                result = MEMORY[getMemoryKey(...params)][params[3]]
            break;

        case 5:
            result = MEMORY[getMemoryKey(...params)][params[3]][params[4]]
            break;
    }

    return typeof result === 'object' ? { ...result } : result
}

exports.getMemoryIndexes = _ =>
    Object.entries(flattenObject(MEMORY)).map(prop => {
        const propSplit = prop[0].split(':')
        if (prop[0].indexOf('previous') !== -1) return false
        return {
            symbol: propSplit[0],
            variable: propSplit[1].replace('.current', ''),
            eval: getEval(prop[0]),
            example: prop[1]
        }
    })
        .filter(ix => ix)
        .sort((a, b) => {
            if (a.variable < b.variable) return -1
            if (a.variable > b.variable) return 1
            return 0
        })

