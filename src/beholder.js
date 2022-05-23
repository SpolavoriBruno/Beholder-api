const { getActiveAutomations } = require('./repositories/automationsRepository')
const { getDefaultSettings } = require('./repositories/settingsRepository')
const { MONITOR_TYPES } = require('./repositories/monitorsRepository')
const { ACTIONS_TYPE } = require('./repositories/actionsRepository')
const { INDEX_KEYS } = require('./utils/indexes')
const logger = require('./utils/logger')
const { sleep } = require('./utils/time')
const { getOrderTemplate } = require('./repositories/orderTemplateRepository')
const { getSymbol } = require('./repositories/symbolsRepository')
const { LIMIT_TYPES, STOP_TYPES, insertOrder } = require('./repositories/ordersRepository')

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
    const automations = await getActiveAutomations()
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
            const result = await doAction(settings, action, automation)
            if (result && typeof cb === 'function') cb(result)
            if (automation.logs) logger.info(`Automation ${automation.name} executed at ${new Date().toISOString()}`)
        })
    })
}

async function doAction(settings, action, automation) {
    try {
        switch (action.type) {
            case ACTIONS_TYPE.ORDER: return await placeOrder(settings, automation, action)
            case ACTIONS_TYPE.ALERT_SMS: return await sendSMS(settings, automation)
            case ACTIONS_TYPE.ALERT_EMAIL: return await sendEmail(settings, automation)
        }
    } catch (error) {
        if (LOGS || automation.logs) {
            if (error.response) logger.error(`Beholder Error - ${error.response.status} - ${error.response.statusText}`, error.response.body)
            else logger.error(`Error on execution of - ${automation.name}:${action.type}`, error)
        }
    }
}

function calcPrice(orderTemplate, symbol, isStop) {
    const tickSize = symbol.tickSize
    let newPrice, factor

    try {
        if (LIMIT_TYPES.includes(orderTemplate.type)) {
            if (isStop) {
                if (parseFloat(orderTemplate.stopPrice)) return orderTemplate.stopPrice
                newPrice = eval(getEval(orderTemplate.stopPrice)) * orderTemplate.stopPriceMultiplier
            } else {
                if (parseFloat(orderTemplate.limitPrice)) return orderTemplate.limitPrice
                newPrice = eval(getEval(orderTemplate.limitPrice)) * orderTemplate.limitPriceMultiplier
            }
        } else {
            const memory = MEMORY[`${orderTemplate.symbol}:BOOK`]
            if (!memory) {
                throw new Error(`Can't get market price for ${orderTemplate.symbol}`, memory)
            }
            newPrice = orderTemplate.side === 'BUY' ? memory.current.bestAsk : memory.current.bestBid
            newPrice = isStop ? newPrice * orderTemplate.stopPriceMultiplier : newPrice * orderTemplate.limitPriceMultiplier

            factor = Math.floor(newPrice / tickSize)
        }
    } catch (error) {
        if (isStop) console.error(`Error on calc Stop Price [${orderTemplate.stopPrice} x ${orderTemplate.stopPriceMultiplier}]`, error)
        else console.error(`Error on calc Price [${orderTemplate.limitPrice} x ${orderTemplate.limitPriceMultiplier}]`, error)
        return false
    }

    return (factor * tickSize).toFixed(symbol.quotePrecision)
}

function calcQty(orderTemplate, price, symbol, isIceberg) {
    let asset

    if (orderTemplate.side === 'BUY') {
        asset = parseFloat(MEMORY[`${symbol.quote}:WALLET`])
        if (!asset) throw new Error(`There is no ${symbol.quote} in your wallet to place a buy order`)
    } else {
        asset = parseFloat(MEMORY[`${symbol.base}:WALLET`])
        if (!asset) throw new Error(`There is no ${symbol.base} in your wallet to place a sell order`)
    }

    let qty = isIceberg ? orderTemplate.icebergQty : orderTemplate.quantity
    qty = qty.replace(',', '.')

    if (parseFloat(qty)) return qty

    const multiplier = isIceberg ? orderTemplate.icebergQtyMultiplier : orderTemplate.quantityMultiplier
    const stepSize = parseFloat(symbol.stepSize)

    let newQty, factor

    switch (orderTemplate.quantity) {
        case "MAX_WALLET":
            if (orderTemplate.side === 'BUY')
                newQty = (parseFloat(asset) / parseFloat(price)) * (multiplier > 1 ? 1 : multiplier)
            else
                newQty = parseFloat(asset) * (multiplier > 1 ? 1 : multiplier)
            break;

        case "MIN_NOTIONAL":
            newQty = (parseFloat(symbol.minNotional) / parseFloat(price)) * (multiplier <= 1 ? 1.02 : multiplier)
            break;

        case "LAST_ORDER_QTY":
            const lastOrder = MEMORY[`${symbol.symbol}:LAST_ORDER`]
            if (!lastOrder) throw new Error(`There is no last order for ${symbol.symbol}`)

            newQty = parseFloat(lastOrder.quantity) * multiplier
            if (orderTemplate.side === 'SELL' && newQty > asset) newQty = asset
            break;
    }

    console.log('[Place Order] Order quantity', orderTemplate.quantity, newQty)

    factor = Math.floor(newQty / stepSize)

    return (factor * stepSize).toFixed(symbol.basePrecision)
}

function hasEnoughAsset(symbol, order, price) {
    const qty = order.type === 'ICEBERG' ? order.options.icebergQty : order.quantity
    if (order.side === 'BUY') {
        return parseFloat(MEMORY[`${symbol.quote}:WALLET`]) >= (qty * price)
    } else {
        return parseFloat(MEMORY[`${symbol.base}:WALLET`]) >= qty
    }
}

async function placeOrder(settings, automation, action) {
    if (!settings || !automation || !action) throw new Error('All parameters are required to place an order.')
    if (!action.orderTemplateId) throw new Error(`There is no order template ["${automation.name}" | actionId: ${action.id}].`)

    const orderTemplate = await getOrderTemplate(action.orderTemplateId)
    const symbol = (await getSymbol(orderTemplate.symbol)).get({ plain: true })

    const order = {
        symbol: symbol.symbol,
        side: orderTemplate.side.toUpperCase(),
        type: orderTemplate.type.toUpperCase(),
    }

    const price = calcPrice(orderTemplate, symbol, false)
    if (!isFinite(price) || !price) throw new Error(`Error in calc price [odti: ${orderTemplate.id}", symbol: ${symbol}, isStop: false].`)
    if (LIMIT_TYPES.includes(order.type)) order.limitPrice = price

    const quantity = calcQty(orderTemplate, price, symbol, false)
    if (!isFinite(quantity) || !quantity) throw new Error(`Error in calc quantity [otid: ${orderTemplate.id}, price: ${price}, symbol: ${symbol}, isIceberg: false] => ${quantity}.`)
    order.quantity = quantity

    if (order.type === 'ICEBERG') {
        const icebergQty = calcQty(orderTemplate, price, symbol, true)
        if (!isFinite(icebergQty) || !icebergQty) throw new Error(`Error in calc icebergQty [otid: ${orderTemplate.id}, price: ${price}, symbol: ${symbol}, isIceberg: true] => ${icebergQty}.`)
        order.options = { icebergQty }
    }
    else if (STOP_TYPES.includes(order.type)) {
        const stopPrice = calcPrice(orderTemplate, symbol, true)
        if (!isFinite(stopPrice) || !stopPrice) throw new Error(`Error in calc stopPrice [odti: ${orderTemplate.id}", symbol: ${symbol}, isStop: true].`)
        order.options = { stopPrice, type: order.type }
    }

    if (!hasEnoughAsset(symbol, order, price)) throw new Error(`Try to ${order.side} ${order.quantity} ${order.symbol}, but you haven't enough assets.`)

    let result
    const exchange = require('./utils/exchange')(settings)
    try {
        if (order.side === 'BUY')
            result = await exchange.buy(order.symbol, order.quantity, order.limitPrice, order.options)
        else
            result = await exchange.sell(order.symbol, order.quantity, order.limitPrice, order.options)
    } catch (error) {
        console.error(`Binance error status ${error.statusCode}`)
        console.error(error.body ? error.body : error)
        console.info(order)
        return { type: 'error', text: error.body ? error.body : error.message }
    }

    insertOrder({
        automationId: automation.id,
        symbol: order.symbol,
        quantity: order.quantity,
        type: order.options?.type || order.type,
        side: order.side,
        limitPrice: order.limitPrice || null,
        stopPrice: order.stopPrice || null,
        icebergQty: order.icebergQty || null,
        orderId: result.orderId,
        clientOrderId: result.clientOrderId,
        transactTime: result.transactTime,
        status: result.status || 'NEW'
    })
    if (LOGS || automation.logs) logger.info(`Beholder place order - ${result.orderId}`)
    return { type: 'success', text: 'Order Executed' }
}

async function sendEmail(settings, automation) {
    await require('./utils/email')(settings, {
        title: `${automation.name} has fired!`,
        text: `Hey, your automation has fired by those conditions ${automation.conditions}`
    })
    return { type: 'success', text: `${automation.name} has fired!` }
}

async function sendSMS(settings, automation) {
    await require('./utils/sms')(settings, {
        title: `${automation.name} has fired!`,
        text: `Your auto "${automation.name}" fired\n${automation.conditions}`
    })
    return { type: 'success', text: `Your auto "${automation.name}" fired\n${automation.conditions}` }
}

const findAutomations = memoryKey => {
    const ids = BRAIN_INDEX[memoryKey]
    if (!ids) return []
    return [...new Set(ids)].map(id => BRAIN[id])
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

