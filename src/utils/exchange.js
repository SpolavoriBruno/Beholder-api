const Binance = require('node-binance-api')
const logger = require('../utils/logger')

module.exports = settings => {
    if (!settings) throw new Error('Settings are required to connect to exchange')
    if (!settings.apiUrl) throw new Error('API URL is required to connect to exchange')
    if (!settings.streamUrl) throw new Error('Stream URL is required to connect to exchange')

    function formatUrl(url) {
        return url.endsWith('/') ? url : `${url}/`
    }

    const privateAPI = new Binance({
        APIKEY: settings.accessKey,
        APISECRET: settings.secretKey,
        urls: {
            base: formatUrl(settings.apiUrl),
            stream: formatUrl(settings.streamUrl)
        }
    })

    const publicAPI = new Binance()

    return {
        balance: () => privateAPI.balance(),

        exchangeInfo: () => publicAPI.exchangeInfo(),

        miniTickerStream: callback =>
            publicAPI.websockets.miniTicker(callback),

        bookStream: callback =>
            publicAPI.websockets.bookTickers(callback),

        userDataStream: (balanceCallback, executionCallback) =>
            privateAPI.websockets.userData(
                balanceCallback,
                executionCallback,
                subscribedData => logger.log(`UserDataStream - Subscribed: ${subscribedData}`)
            ),

        buy: (symbols, quantity, price, options) => {
            if (price)
                return privateAPI.buy(symbols, quantity, price, options)
            return privateAPI.marketBuy(symbols, quantity)
        },

        sell: (symbols, quantity, price, options) => {
            if (price)
                return privateAPI.sell(symbols, quantity, price, options)
            return privateAPI.marketSell(symbols, quantity)
        },

        cancel: (symbol, orderId) => privateAPI.cancel(symbol, orderId),

        orderStatus: (symbol, orderId) => {
            return privateAPI.orderStatus(symbol, orderId)
        },

        orderTrade: async (symbol, orderId) => {
            const trades = await privateAPI.trades(symbol)
            return trades.find(trade => trade.orderId === orderId)
        },

        chartStream: (symbol, interval, callback) => {
            publicAPI.websockets.chart(symbol, interval, (symbol, interval, chart) => {
                const ohlc = publicAPI.ohlc(chart)
                callback(ohlc)
            })
        }
    }
}
