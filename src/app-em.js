const WebSocket = require('ws')
const crypto = require('./utils/crypto')

const BOOK_STREAM_CACHE_SIZE = 10

module.exports = (settings, wss) => {
    settings.secretKey = crypto.decrypt(settings.secretKey)

    const exchange = require('./utils/exchange')(settings)

    exchange.miniTickerStream(markets => {
        if (!wss || !wss.clients) return
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ miniTicker: markets }))
            }
        });
    })

    let book = []
    exchange.bookStream(order => {
        if (!wss || !wss.clients) return
        if (book.length === BOOK_STREAM_CACHE_SIZE) {
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ book }))
                }
            });
            book = []
        }
        else book.push(order)
    })

    console.info("Exchange Monitor is running")
}
