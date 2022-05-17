const logger = require('./utils/logger')
const { updateOrderByOrderId } = require('./repositories/ordersRepository')
const { ORDER_STATUS } = require('./utils/status')
const { getActiveMonitors, MONITOR_TYPES } = require('./repositories/monitorsRepository')
const { processIndexes } = require('./utils/indexes')
const { MEMORY_KEYS } = require('./beholder')

const BOOK_STREAM_CACHE_SIZE = 10
let WSS, beholder, exchange;
let book = []

function processExecutionData(executionData, broadcastLabel) {
    if (executionData.X === ORDER_STATUS.NEW) return;

    const order = {
        symbol: executionData.s,
        orderId: executionData.i,
        clientOrderId: executionData.X === ORDER_STATUS.CANCELED ? executionData.C : executionData.c,
        side: executionData.S,
        type: executionData.o,
        status: executionData.X,
        isMaker: executionData.m,
        transactTime: executionData.T,
    }

    if (order.status === ORDER_STATUS.FILLED) {
        const quoteAmount = parseFloat(executionData.Z)
        const isQuoteCommission = executionData.N && order.symbol.endsWith(executionData.N)

        order.avgPrice = quoteAmount / parseFloat(executionData.z)
        order.commision = executionData.n
        order.net = isQuoteCommission ? quoteAmount - order.commision : quoteAmount
    }

    if (order.status === ORDER_STATUS.REJECTED)
        order.obs = executionData.r

    setTimeout(() => {
        updateOrderByOrderId(order.orderId, order.clientOrderId, order)
            .then(_order => {
                if (_order) {

                    beholder.updateMemory({
                        symbol: order.symbol,
                        index: MEMORY_KEYS.LAST_ORDER,
                        value: order
                    }, r => WSS.broadcast({ notification: r }))

                    if (broadcastLabel && WSS)
                        WSS.broadcast({ [broadcastLabel]: order })
                }
            })
            .catch(error => logger.error(error))
    }, 3000);
}

async function loadWallet(exchange) {
    if (!exchange) throw new Error('Exchange is not initialized')

    const info = await exchange.balance()

    return Object.entries(info || []).map(item => {
        beholder.updateMemory({
            symbol: item[0],
            index: MEMORY_KEYS.WALLET,
            value: parseFloat(item[1].available)
        }, r => WSS.broadcast({ notification: r }))

        return {
            symbol: item[0],
            avaliable: item[1].available,
            onOrder: item[1].onOrder,
        }
    })
}

function sanatizeTicker(data) {
    delete data.eventType
    delete data.eventTime
    delete data.symbol
    delete data.openTime
    delete data.closeTime
    delete data.firstTradeId
    delete data.lastTradeId
    delete data.numTrades
    delete data.quoteVolume
    delete data.closeQty
    delete data.bestBidQty
    delete data.bestAskQty
    delete data.volume

    data.priceChange = parseFloat(data.priceChange)
    data.percentChange = parseFloat(data.percentChange)
    data.averagePrice = parseFloat(data.averagePrice)
    data.prevClose = parseFloat(data.prevClose)
    data.open = parseFloat(data.open)
    data.close = parseFloat(data.close)
    data.bestBid = parseFloat(data.bestBid)
    data.bestAsk = parseFloat(data.bestAsk)
    data.high = parseFloat(data.high)
    data.low = parseFloat(data.low)

    return data
}

function startUserDataMonitor(broadcastLabel, logs) {
    if (!exchange) throw new Error('Exchange is not initialized')

    const [balanceBroadcast, executionBroadcast] = broadcastLabel ? broadcastLabel.split(',') : [null, null]

    exchange.userDataStream(
        _ => {
            const wallet = loadWallet(exchange)
            if (logs) logger.info(`Book Monitor - ${broadcastLabel}`, order)
            if (balanceBroadcast && WSS) WSS.broadcast({ [balanceBroadcast]: wallet })
        },
        executionData => {
            processExecutionData(executionData, executionBroadcast)
        }
    )
    logger.info(`Start User Data Monitor - ${broadcastLabel}`)
}

function startMiniTickerMonitor(symbol, broadcastLabel, logs) {
    if (!exchange) throw new Error('Exchange is not initialized')
    try {

        exchange.miniTickerStream(symbol, markets => {
            if (logs) logger.info(`Mini Ticker Monitor - ${broadcastLabel}`, markets)

            if (broadcastLabel && WSS)
                WSS.broadcast({ [broadcastLabel]: markets })

            Object.entries(markets).map(market => {
                delete market[1].volume
                delete market[1].quoteVolume
                delete market[1].eventTime

                const converted = {}
                Object.entries(market[1]).map(prop => converted[prop[0]] = parseFloat(prop[1]))
                beholder.updateMemory({
                    symbol: market[0],
                    value: converted,
                    index: MEMORY_KEYS.MINI_TICKER,
                }, r => WSS.broadcast({ notification: r }))
            })
        })
    } catch (error) {

    }
    logger.info(`Start Mini-Ticker Monitor - ${broadcastLabel}`)
}

function stopMiniTickerMonitor(symbol) {
    if (!exchange) throw new Error('Exchange is not initialized')
    if (!symbol) return new Error('Cant stop chart monitor without symbol')

    exchange.terminateMiniTickerStream(symbol, console.info)
    logger.info(`Stop Mini-Ticker Monitor - ${symbol}`)
}

function startBookMonitor(symbol, broadcastLabel, logs) {
    if (!exchange) throw new Error('Exchange is not initialized')

    exchange.bookStream(symbol, order => {
        if (logs) logger.info(`Book Monitor - ${broadcastLabel}`, order)

        if (book.length >= BOOK_STREAM_CACHE_SIZE) {
            if (broadcastLabel && WSS) {
                WSS.broadcast({ [broadcastLabel]: book })
                book = []
            }
        }
        else book.push(order)

        const orderCopy = { ...order }
        delete orderCopy.symbol
        delete orderCopy.updatedId
        const converted = {}
        Object.entries(orderCopy).map(prop => converted[prop[0]] = parseFloat(prop[1]))
        beholder.updateMemory({
            symbol: order.symbol,
            index: MEMORY_KEYS.BOOK,
            value: converted,
        }, r => WSS.broadcast({ notification: r }))
    })
    logger.info(`Start Book Monitor - ${broadcastLabel}`)
}

function stopBookMonitor(symbol) {
    if (!exchange) throw new Error('Exchange is not initialized')
    if (!symbol) return new Error('Cant stop chart monitor without symbol')

    exchange.terminateBookStream(symbol, console.info)
    logger.info(`Stop Book Monitor - ${symbol}`)
}

function startChartMonitor(symbol, interval, indexes, broadcastLabel, logs) {
    if (!exchange) throw new Error('Exchange is not initialized')
    if (!symbol) return new Error('Cant start chart monitor without symbol')
    if (!interval) return new Error('Cant start chart monitor without interval')
    if (!indexes) return

    exchange.chartStream(symbol, interval, ohlc => {
        const lastCandle = {
            open: ohlc.open[ohlc.open.length - 1],
            close: ohlc.close[ohlc.close.length - 1],
            high: ohlc.high[ohlc.high.length - 1],
            low: ohlc.low[ohlc.low.length - 1],
        }

        if (logs) logger.info(`Chart Monitor - ${broadcastLabel}`, lastCandle)
        if (broadcastLabel && WSS) WSS.broadcast({ [broadcastLabel]: lastCandle })
        beholder.updateMemory({
            symbol, interval,
            value: lastCandle,
            index: MEMORY_KEYS.LAST_CANDLE,
        }, r => WSS.broadcast({ notification: r }))

        processIndexes(indexes, ohlc, (index, value, process) => {
            beholder.updateMemory(
                { symbol, index, interval, value, process },
                r => {
                    WSS.broadcast({ notification: r })
                })
        })
    })
    logger.info(`Start Chart Monitor - ${symbol}.${broadcastLabel}`)
}

function stopChartMonitor(symbol, interval, indexes, logs) {
    if (!exchange) throw new Error('Exchange is not initialized')
    if (!symbol) return new Error('Cant stop chart monitor without symbol')

    exchange.terminateChartStream(symbol, interval)
    beholder.deleteMemory(symbol, MEMORY_KEYS.LAST_CANDLE, interval)

    if (indexes && Array.isArray(indexes))
        indexes.map(index => beholder.deleteMemory(symbol, index, interval))

    logger.info(`Stop Chart Monitor - ${symbol}.${interval}`)
}

function startTickerMonitor(symbol, broadcastLabel, logs) {
    if (!exchange) throw new Error('Exchange is not initialized')
    if (!symbol) return new Error('Cant start chart monitor without symbol')

    exchange.tickerStream(symbol, data => {
        try {
            const ticker = sanatizeTicker({ ...data })
            const currentMemory = beholder.getMemory(symbol, MEMORY_KEYS.TICKER)

            const newMemory = {}
            newMemory.previous = currentMemory ? currentMemory.current : ticker
            newMemory.current = ticker

            beholder.updateMemory({
                symbol: data.symbol,
                index: MEMORY_KEYS.TICKER,
                value: newMemory
            }, r => WSS.broadcast({ notification: r }))

            if (broadcastLabel && WSS) WSS.broadcast({ [broadcastLabel]: data })

        } catch (error) {
            if (logs) logger.error(error)
        }
    })
    logger.info(`Start Ticker Monitor - ${symbol}.${broadcastLabel}`)
}

function stopTickerMonitor(symbol, logs) {
    if (!exchange) throw new Error('Exchange is not initialized')
    if (!symbol) return new Error('Cant stop Ticker monitor without symbol')

    exchange.terminateTickerStream(symbol)

    beholder.deleteMemory(symbol, MEMORY_KEYS.TICKER)

    logger.info(`Stop Ticker Monitor - ${symbol}`)
}

exports.stopMonitor = monitor => {
    switch (monitor.type) {
        case MONITOR_TYPES.CANDLES:
            const indexes = monitor.indexes ? monitor.indexes.split(',') : []
            return stopChartMonitor(monitor.symbol, monitor.interval, indexes, monitor.logs)
        case MONITOR_TYPES.BOOK:
            return stopBookMonitor(monitor.symbol)
        case MONITOR_TYPES.MINI_TICKER:
            return stopMiniTickerMonitor(monitor.symbol)
        case MONITOR_TYPES.TICKER:
            return stopTickerMonitor(monitor.symbol)

    }
}

exports.startMonitor = ({ symbol, type, broadcastLabel, logs, indexes, interval }) => {
    symbol = symbol === '*' ? null : symbol

    switch (type) {
        case MONITOR_TYPES.MINI_TICKER:
            return startMiniTickerMonitor(symbol, broadcastLabel, logs)

        case MONITOR_TYPES.TICKER:
            return startTickerMonitor(symbol, broadcastLabel, logs)

        case MONITOR_TYPES.BOOK:
            return startBookMonitor(symbol, broadcastLabel, logs)

        case MONITOR_TYPES.USER_DATA:
            return startUserDataMonitor(broadcastLabel, logs)

        case MONITOR_TYPES.CANDLES:
            indexes = indexes ? indexes.split(',') : []
            return startChartMonitor(
                symbol,
                interval,
                indexes,
                broadcastLabel,
                logs
            )
    }
}

exports.init = async (settings, beholderInstance, wssInstance) => {
    if (!settings || !beholderInstance || !wssInstance) throw new Error('Bad configuration in Exchange Monitor')

    WSS = wssInstance
    beholder = beholderInstance

    exchange = require('./utils/exchange')(settings)
    if (!exchange) throw new Error('Exchange is not initialized')

    const monitors = await getActiveMonitors()
    monitors.map(monitor =>
        setTimeout(() => {
            this.startMonitor(monitor)
        }, 300))

    logger.info("Exchange Monitor is running")
}
