const technicalindicators = require('technicalindicators')

exports.INDEX_KEYS = {
    RSI: 'RSI',
    MACD: 'MACD',
    SMA: 'SMA',
    EMA: 'EMA',
    STOCH_RSI: 'SRSI',
    BOLLINGER_BAND: 'BB',
}

exports.RSI = (closes, period = 14) => {
    const rsi = technicalindicators.rsi({
        period: parseInt(period),
        values: closes
    })

    return {
        current: rsi[rsi.length - 1],
        previous: rsi[rsi.length - 2]
    }
}


exports.MACD = (closes, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
    const macd = technicalindicators.macd({
        SimpleMAOscillator: false,
        SimpleMASignal: false,
        values: closes,
        signalPeriod: parseInt(signalPeriod),
        fastPeriod: parseInt(fastPeriod),
        slowPeriod: parseInt(slowPeriod),
    })

    return {
        current: macd[macd.length - 1],
        previous: macd[macd.length - 2]
    }
}

exports.SMA = (closes, period = 10) => {
    const sma = technicalindicators.sma({
        period: parseInt(period),
        values: closes
    })
    return {
        current: sma[sma.length - 1],
        previous: sma[sma.length - 2]
    }
}

exports.EMA = (closes, period = 10) => {
    const ema = technicalindicators.ema({
        period: parseInt(period),
        values: closes
    })
    return {
        current: ema[ema.length - 1],
        previous: ema[ema.length - 2]
    }
}

exports.StochRSI = (closes, dPeriod = 3, kPeriod = 3, rsiPeriod = 14, stochasticPeriod = 14) => {
    const stochRSI = technicalindicators.stochRSI({
        dPeriod: parseInt(dPeriod),
        kPeriod: parseInt(kPeriod),
        rsiPeriod: parseInt(rsiPeriod),
        stochasticPeriod: parseInt(stochasticPeriod),
        values: closes
    })
    return {
        current: stochRSI[stochRSI.length - 1],
        previous: stochRSI[stochRSI.length - 2]
    }
}

exports.BollingerBands = (closes, period = 20, stdDev = 2) => {
    const bollingerBands = technicalindicators.bollingerBands({
        period: parseInt(period),
        stdDev: parseInt(stdDev),
        values: closes
    })
    return {
        current: bollingerBands[bollingerBands.length - 1],
        previous: bollingerBands[bollingerBands.length - 2]
    }
}

exports.processIndexes = (indexes, interval, ohlc, callback) => {
    indexes.map(index => {
        let result
        switch (index) {
            case this.INDEX_KEYS.RSI:
                result = this.RSI(ohlc.close)
                break

            case this.INDEX_KEYS.MACD:
                result = this.MACD(ohlc.close)
                break

            case this.INDEX_KEYS.SMA:
                result = this.SMA(ohlc.close)
                break

            case this.INDEX_KEYS.EMA:
                result = this.EMA(ohlc.close)
                break

            case this.INDEX_KEYS.STOCH_RSI:
                result = this.StochRSI(ohlc.close)
                break

            case this.INDEX_KEYS.BOLLINGER_BAND:
                result = this.BollingerBands(ohlc.close)
                break

        }
        callback(index, result)
    })
}
