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

function startUserDataMonitor(broadcastLabel, logs) {
    if (!exchange) throw new Error('Exchange is not initialized')

    const [balanceBroadcast, executionBroadcast] = broadcastLabel.split(',')

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

exports.stopMonitor = monitor => {
    switch (monitor.type) {
        case MONITOR_TYPES.CANDLES:
            const indexes = monitor.indexes ? monitor.indexes.split(',') : []
            return stopChartMonitor(monitor.symbol, monitor.interval, indexes, monitor.logs)
        case MONITOR_TYPES.BOOK:
            return stopBookMonitor(monitor.symbol)
        case MONITOR_TYPES.MINI_TICKER:
            return stopMiniTickerMonitor(monitor.symbol)
    }
}

exports.startMonitor = monitor => {
    switch (monitor.type) {
        case MONITOR_TYPES.BOOK:
            return startBookMonitor(monitor.symbol, monitor.broadcastLabel, monitor.logs)
        case MONITOR_TYPES.MINI_TICKER:
            return startMiniTickerMonitor(monitor.symbol, monitor.broadcastLabel, monitor.logs)
        case MONITOR_TYPES.CANDLES:
            const indexes = monitor.indexes ? monitor.indexes.split(',') : []
            return startChartMonitor(monitor.symbol, monitor.interval, indexes, monitor.broadcastLabel, monitor.logs)
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
            const symbol = monitor.symbol === '*' ? null : monitor.symbol
            switch (monitor.type) {
                case INDEX_KEYS.MINI_TICKER:
                    return startMiniTickerMonitor(symbol, monitor.broadcastLabel, monitor.logs)

                case INDEX_KEYS.BOOK:
                    return startBookMonitor(symbol, monitor.broadcastLabel, monitor.logs)

                case INDEX_KEYS.USER_DATA:
                    return startUserDataMonitor(monitor.broadcastLabel, monitor.logs)

                case INDEX_KEYS.CANDLES:
                    return startChartMonitor(
                        monitor.symbol,
                        monitor.interval,
                        monitor.indexes.split(','),
                        monitor.broadcastLabel,
                        monitor.logs
                    )
            }
        }, 300)
    })

    logger.info("Exchange Monitor is running")
}
