const Binance = require('node-binance-api')
const logger = require('../utils/logger')

module.exports = settings => {
    if (!settings) throw new Error('Settings are required to connect to exchange')
    if (!settings.apiUrl) throw new Error('API URL is required to connect to exchange')
    if (!settings.streamUrl) throw new Error('Stream URL is required to connect to exchange')

    function formatUrl(url) {
        return url.endsWith('/') ? url : `${url}/`
    }

    const binance = new Binance({
        APIKEY: settings.accessKey,
        APISECRET: settings.secretKey,
        urls: {
            base: formatUrl(settings.apiUrl),
            stream: formatUrl(settings.streamUrl)
        }
    })

    const balance = () => binance.balance()

    const exchangeInfo = () => binance.exchangeInfo()

    const miniTickerStream = callback =>
        binance.websockets.miniTicker(callback)

    const bookStream = callback =>
        binance.websockets.bookTickers(callback)

    const userDataStream = (balanceCallback, executionCallback) =>
        binance.websockets.userData(
            balanceCallback,
            executionCallback,
            subscribedData => logger.log(`UserDataStream - Subscribed: ${subscribedData}`)
        )

    const buy = (symbols, quantity, price, options) => {
        if (price)
            return binance.buy(symbols, quantity, price, options)
        return binance.marketBuy(symbols, quantity)
    }

    const sell = (symbols, quantity, price, options) => {
        if (price)
            return binance.sell(symbols, quantity, price, options)
        return binance.marketSell(symbols, quantity)
    }

    const cancel = (symbol, orderId) => binance.cancel(symbol, orderId)

    return {
        balance,
        exchangeInfo,
        bookStream,
        miniTickerStream,
        userDataStream,
        buy,
        sell,
        cancel,
    }
}


