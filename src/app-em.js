const WebSocket = require('ws')
const crypto = require('./utils/crypto')
const logger = require('./utils/logger')

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
        });
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
        executionData => broadcast({ execution: executionData })
    )

    logger.info("Exchange Monitor is running")
}
