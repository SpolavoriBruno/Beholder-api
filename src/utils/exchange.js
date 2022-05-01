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
    return {
        balance: () => binance.balance(),

        exchangeInfo: () => binance.exchangeInfo(),

        miniTickerStream: callback =>
            binance.websockets.miniTicker(callback),

        bookStream: callback =>
            binance.websockets.bookTickers(callback),

        userDataStream: (balanceCallback, executionCallback) =>
            binance.websockets.userData(
                balanceCallback,
                executionCallback,
                subscribedData => logger.log(`UserDataStream - Subscribed: ${subscribedData}`)
            ),

        buy: (symbols, quantity, price, options) => {
            if (price)
                return binance.buy(symbols, quantity, price, options)
            return binance.marketBuy(symbols, quantity)
        },

        sell: (symbols, quantity, price, options) => {
            if (price)
                return binance.sell(symbols, quantity, price, options)
            return binance.marketSell(symbols, quantity)
        },

        cancel: (symbol, orderId) => binance.cancel(symbol, orderId),

        orderStatus: (symbol, orderId) => {
            return binance.orderStatus(symbol, orderId)
        },

        orderTrade: async (symbol, orderId) => {
            const trades = await binance.trades(symbol)
            return trades.find(trade => trade.orderId === orderId)
        },

        chartStream: (symbol, interval, callback) => {
            binance.websockets.chart(symbol, interval, (symbol, interval, chart) => {
                const ohlc = binance.ohlc(chart)
                callback(ohlc)
            })
        }
    }
}
