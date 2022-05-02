const technicalindicators = require('technicalindicators')

exports.INDEX_KEYS = {
    RSI: 'RSI',
    MACD: 'MACD',
    WALLET: 'WALLET',
    LAST_ORDER: 'LAST_ORDER',
    LAST_CANDLE: 'LAST_CANDLE',
}

exports.RSI = (closes, period = 14) => {
    const rsiResult = technicalindicators.rsi({
        period,
        values: closes
    })

    return {
        current: rsiResult[rsiResult.length - 1],
        previous: rsiResult[rsiResult.length - 2]
    }
}


exports.MACD = (closes, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
    const macdResult = technicalindicators.macd({
        SimpleMAOscillator: false,
        SimpleMASignal: false,
        values: closes,
        signalPeriod,
        fastPeriod,
        slowPeriod,
    })

    return {
        current: macdResult[macdResult.length - 1],
        previous: macdResult[macdResult.length - 2]
    }
}
