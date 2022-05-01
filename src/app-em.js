const WebSocket = require('ws')
const crypto = require('./utils/crypto')
const logger = require('./utils/logger')
const { updateOrderByOrderId } = require('./repositories/ordersRepository')
const { ORDER_STATUS } = require('./utils/status')

const BOOK_STREAM_CACHE_SIZE = 10

module.exports = (settings, wss) => {
    settings.secretKey = crypto.decrypt(settings.secretKey)

    const exchange = require('./utils/exchange')(settings)

    function broadcast(jsonObject) {
        if (!wss || !wss.clients) return
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(jsonObject))
            }
        })
    }

    function processExecutionData(executionData) {
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
                .then(order => broadcast({ execution: order }))
                .catch(error => console.error(error))
        }, 3000);
    }

    exchange.miniTickerStream(markets => {
        broadcast({ miniTicker: markets })
    })

    let book = []
    exchange.bookStream(order => {
        if (book.length === BOOK_STREAM_CACHE_SIZE) {
            broadcast({ book })
            book = []
        }
        else book.push(order)
    })

    exchange.userDataStream(
        balanceData => broadcast({ balance: balanceData }),
        processExecutionData
    )

    logger.info("Exchange Monitor is running")
}
