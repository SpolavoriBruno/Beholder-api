const logger = require('./utils/logger')
const { updateOrderByOrderId } = require('./repositories/ordersRepository')
const { ORDER_STATUS } = require('./utils/status')
const { getActiveMonitors, MONITOR_TYPES } = require('./repositories/monitorsRepository')
const { processIndexes } = require('./utils/indexes')
const { INDEX_KEYS } = require('./beholder')

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
            .then(order => {
                if (order) {

                    beholder.updateMemory(order.symbol, INDEX_KEYS.LAST_ORDER, null, order)

                    if (broadcastLabel && WSS)
                        WSS.broadcast({ [broadcastLabel]: order })
                }
            })
            .catch(error => logger.error(error))
    }, 3000);
}

async function loadWallet(exchange) {
    if (!exchange) throw new Error('Exchange is not initialized')

    try {
        const info = await exchange.balance()

        // TODO: info is not defined | 'balanceData error' in binance lib?
        const wallet = Object.entries(info || []).map(item => {

            beholder.updateMemory(item[0], INDEX_KEYS.WALLET, null, parseFloat(item[1].available))

            return {
                symbol: item[0],
                avaliable: item[1].available,
                onOrder: item[1].onOrder,
            }
        })
        return wallet
    } catch (error) {

    }
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

    return data
}

function startUserDataMonitor(broadcastLabel, logs) {
    if (!exchange) throw new Error('Exchange is not initialized')

    const [balanceBroadcast, executionBroadcast] = broadcastLabel ? broadcastLabel.split(',') : [null, null]

    loadWallet(exchange)

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
                beholder.updateMemory(market[0], INDEX_KEYS.MINI_TICKER, null, converted)
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
        beholder.updateMemory(order.symbol, INDEX_KEYS.BOOK, null, converted)

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

    exchange.chartStream(symbol, interval || '1m', ohlc => {
        const lastCandle = {
            open: ohlc.open[ohlc.open.length - 1],
            close: ohlc.close[ohlc.close.length - 1],
            high: ohlc.high[ohlc.high.length - 1],
            low: ohlc.low[ohlc.low.length - 1],
        }

        if (logs) logger.info(`Chart Monitor - ${broadcastLabel}`, lastCandle)
        if (broadcastLabel && WSS) WSS.broadcast({ [broadcastLabel]: lastCandle })

        beholder.updateMemory(symbol, INDEX_KEYS.LAST_CANDLE, interval, lastCandle)

        processIndexes(indexes, interval, ohlc, (index, result) => {
            beholder.updateMemory(symbol, index, interval, result)
        })
    })
    logger.info(`Start Chart Monitor - ${symbol}.${broadcastLabel}`)

}

function stopChartMonitor(symbol, interval, indexes, logs) {
    if (!exchange) throw new Error('Exchange is not initialized')
    if (!symbol) return new Error('Cant stop chart monitor without symbol')

    exchange.terminateChartStream(symbol, interval)
    beholder.deleteMemory(symbol, INDEX_KEYS.LAST_CANDLE, interval)
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
            const currentMemory = beholder.getMemory(symbol, INDEX_KEYS.TICKER)

            const newMemory = {}
            newMemory.previous = currentMemory ? currentMemory.current : null
            newMemory.current = ticker

            beholder.updateMemory(data.symbol, INDEX_KEYS.TICKER, null, newMemory)

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

    beholder.deleteMemory(symbol, INDEX_KEYS.LAST_CANDLE)

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
    monitors.map(monitor => {
        setTimeout(() => {
            this.startMonitor(monitor)
        }, 300)
    })

    logger.info("Exchange Monitor is running")
}
