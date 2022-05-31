const { ACTIONS_TYPE } = require('../repositories/actionsRepository')
const { getOrderTemplate } = require('../repositories/orderTemplateRepository')
const { getSymbol } = require('../repositories/symbolsRepository')
const { LIMIT_TYPES, STOP_TYPES, insertOrder } = require('../repositories/ordersRepository')
const logger = require('../utils/logger')

const LOGS = process.env.BEHOLDER_LOGS === 'true'
let beholder

exports.doAction = async (settings, action, automation, _beholder) => {
    if (!_beholder) throw new Error('In doAction - Beholder instance is required')
    beholder = _beholder

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
        // const memory = MEMORY[`${orderTemplate.symbol}:BOOK`]
        const memory = beholder.getMemory(orderTemplate.symbol, beholder.MEMORY_KEYS.BOOK)
        if (!memory) throw new Error(`Can't get market price for ${orderTemplate.symbol}`, memory)


        if (orderTemplate.type === 'MARKET')
            return orderTemplate.side === 'BUY' ? memory.current.bestAsk : memory.current.bestBid

        else if (LIMIT_TYPES.includes(orderTemplate.type)) {
            if (isStop) {
                if (parseFloat(orderTemplate.stopPrice)) return orderTemplate.stopPrice
                newPrice = beholder.getMemory(orderTemplate.stopPrice) * orderTemplate.stopPriceMultiplier
            } else {
                if (parseFloat(orderTemplate.limitPrice)) return orderTemplate.limitPrice
                newPrice = beholder.getMemory(orderTemplate.limitPrice) * orderTemplate.limitPriceMultiplier
            }
        } else {
            newPrice = orderTemplate.side === 'BUY' ? memory.current.bestAsk : memory.current.bestBid
            newPrice = isStop ? newPrice * orderTemplate.stopPriceMultiplier : newPrice * orderTemplate.limitPriceMultiplier
        }
    } catch (error) {
        if (isStop) console.error(`Error on calc Stop Price [${orderTemplate.stopPrice} x ${orderTemplate.stopPriceMultiplier}] ${orderTemplate.id}`, error)
        else console.error(`Error on calc Price [${orderTemplate.limitPrice} x ${orderTemplate.limitPriceMultiplier}] ${orderTemplate.id}`, error)
        return false
    }

    factor = Math.floor(newPrice / tickSize);
    return (factor * tickSize).toFixed(symbol.quotePrecision)
}

function calcQty(orderTemplate, price, symbol, isIceberg) {
    let asset

    if (orderTemplate.side === 'BUY') {
        // asset = parseFloat(MEMORY[`${symbol.quote}:WALLET`])
        asset = parseFloat(beholder.getMemory(symbol.quote, beholder.MEMORY_KEYS.WALLET))
        if (!asset) throw new Error(`There is no ${symbol.quote} in your wallet to place a buy order`)
    } else {
        // asset = parseFloat(MEMORY[`${symbol.base}:WALLET`])
        asset = parseFloat(beholder.getMemory(symbol.base, beholder.MEMORY_KEYS.WALLET))
        if (!asset) throw new Error(`There is no ${symbol.base} in your wallet to place a sell order`)
    }

    let qty = isIceberg ? orderTemplate.icebergQty : orderTemplate.quantity
    qty = qty.replace(',', '.')

    if (parseFloat(qty)) return qty

    const multiplier = isIceberg ? orderTemplate.icebergQtyMultiplier : orderTemplate.quantityMultiplier
    const stepSize = parseFloat(symbol.stepSize)

    let newQty

    switch (orderTemplate.quantity) {
        case "MAX_WALLET":
            if (orderTemplate.side === 'BUY')
                newQty = (parseFloat(asset) / parseFloat(price)) * (multiplier > 1 ? 1 : multiplier)
            else
                newQty = parseFloat(asset) * (multiplier > 1 ? 1 : multiplier)
            break;

        case "LAST_ORDER_QTY":
            // const lastOrder = MEMORY[`${symbol.symbol}:LAST_ORDER`]
            const lastOrder = beholder.getMemory(symbol.symbol, beholder.MEMORY_KEYS.LAST_ORDER)
            if (!lastOrder) throw new Error(`There is no last order for ${symbol.symbol}`)

            newQty = parseFloat(lastOrder.quantity) * multiplier
            if (orderTemplate.side === 'SELL' && newQty > asset) newQty = asset
            break;

        default:
            newQty = (parseFloat(symbol.minNotional) / parseFloat(price)) * (multiplier <= 1 ? 1 : multiplier)
    }
    const factor = Math.ceil(newQty / stepSize) + 1

    return (factor * stepSize).toFixed(symbol.basePrecision)
}

function hasEnoughAsset(symbol, order, price) {
    const qty = order.type === 'ICEBERG' ? order.options.icebergQty : order.quantity
    if (order.side === 'BUY') {
        // const quoteInWallet = MEMORY[`${symbol.quote}:WALLET`]
        const quoteInWallet = beholder.getMemory(symbol.quote, beholder.MEMORY_KEYS.WALLET)
        return parseFloat(quoteInWallet) >= (qty * price)
    } else {
        // const baseInWallet = MEMORY[`${symbol.base}:WALLET`]
        const baseInWallet = beholder.getMemory(symbol.base, beholder.MEMORY_KEYS.WALLET)
        return parseFloat(baseInWallet) >= qty
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
    if (!isFinite(price) || !price) throw new Error(`Error in calc price [odti: ${orderTemplate.id}", symbol: ${symbol.symbol}, isStop: false].`)

    if (LIMIT_TYPES.includes(order.type)) order.limitPrice = price

    const quantity = calcQty(orderTemplate, price, symbol, false)
    if (!isFinite(quantity) || !quantity) throw new Error(`Error in calc quantity [otid: ${orderTemplate.id}, price: ${price}, symbol: ${symbol.symbol}, isIceberg: false] => ${quantity}.`)

    order.quantity = quantity

    if (order.type === 'ICEBERG') {
        const icebergQty = calcQty(orderTemplate, price, symbol, true)
        if (!isFinite(icebergQty) || !icebergQty) throw new Error(`Error in calc icebergQty [otid: ${orderTemplate.id}, price: ${price}, symbol: ${symbol.symbol}, isIceberg: true] => ${icebergQty}.`)

        order.options = { icebergQty }
    }
    else if (STOP_TYPES.includes(order.type)) {
        const stopPrice = calcPrice(orderTemplate, symbol, true)
        if (!isFinite(stopPrice) || !stopPrice) throw new Error(`Error in calc stopPrice [odti: ${orderTemplate.id}", symbol: ${symbol.symbol}, isStop: true].`)

        order.options = { stopPrice, type: order.type }
    }

    if (!hasEnoughAsset(symbol, order, price)) throw new Error(`Try to ${order.side} ${order.quantity} ${order.symbol}, but you haven't enough assets.`)


    let result
    const exchange = require('../utils/exchange')(settings)
    try {
        if (order.side === 'BUY')
            result = await exchange.buy(order.symbol, order.quantity, order.limitPrice, order.options)
        else
            result = await exchange.sell(order.symbol, order.quantity, order.limitPrice, order.options)
    } catch (error) {
        error.statusCode && console.error(`Binance error status ${error.statusCode}`)
        error.body && console.error('[ Place Order ]', error.body.msg)

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
    await require('../utils/email')(settings, {
        title: `${automation.name} has fired!`,
        text: `Hey, your automation has fired by those conditions ${automation.conditions}`
    })
    return { type: 'success', text: `${automation.name} has fired!` }
}

async function sendSMS(settings, automation) {
    await require('../utils/sms')(settings, {
        title: `${automation.name} has fired!`,
        text: `Your auto "${automation.name}" fired\n${automation.conditions}`
    })
    return { type: 'success', text: `Your auto "${automation.name}" fired\n${automation.conditions}` }
}
