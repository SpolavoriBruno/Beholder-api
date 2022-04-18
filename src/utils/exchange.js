const Binance = require('node-binance-api')

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

    const exchangeInfo = () => binance.exchangeInfo()

    const miniTickerStream = callback =>
        binance.websockets.miniTicker(markets => callback(markets))

    const bookStream = callback =>
        binance.websockets.bookTickers(order => callback(order))


    return {
        exchangeInfo,
        bookStream,
        miniTickerStream
    }
}


