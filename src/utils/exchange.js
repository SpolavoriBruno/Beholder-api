const Binance = require('node-binance-api')

module.exports = settings => {
    if (!settings) throw new Error('Settings are required to connect to exchange')

    const binance = new Binance({
        APIKEY: settings.accessKey,
        APISECRET: settings.secretKey,
        urls: {
            base: settings.apiUrl.endsWith('/') ? settings.apiUrl : `${settings.apiUrl}/`,
        }
    })

    function exchangeInfo() {
        return binance.exchangeInfo()
    }

    return {
        exchangeInfo
    }
}
