const technicalindicators = require('technicalindicators')

const INDEX_KEYS = {
    // Technical Indicators
    ADL: 'ADL',
    ADX: 'ADX',
    ATR: 'ATR',
    CCI: 'CCI',
    EMA: 'EMA',
    KST: 'KST',
    MFI: 'MFI',
    OBV: 'OBV',
    ROC: 'ROC',
    RSI: 'RSI',
    SMA: 'SMA',
    WMA: 'WMA',
    MACD: 'MACD',
    PSAR: 'PSAR',
    TRIX: 'TRIX',
    VWAP: 'VWAP',
    WEMA: 'WEMA',
    STOCH: 'STOCH',
    WILLIAMS_R: 'WR',
    FORCE_INDEX: 'FI',
    STOCH_RSI: 'S-RSI',
    ICHIMOKU: 'ICHIMOKU',
    BOLLINGER_BANDS: 'BB',
    VOLUME_PROFILE: 'VP',
    AWESOME_OSCILLATOR: 'AO',
    // Candles
    INSIDE_CANDLE: 'INSIDE-CANDLE',
    DOJI: 'DOJI',
    HAMMER: 'HAMMER',
    HANGING_MAN: 'HANGMAN',
    TWEEZER_TOP: 'TWEEZER-TOP',
    SHOOTING_STAR: 'SHOOT-STAR',
    TWEEZER_BOTTOM: 'TWEEZER-BOTTOM',
    ABANDONED_BABY: 'ABANDONED-BABY',
    BEARISH_HARAMI: 'BEAR-HARAMI',
    BULLISH_HARAMI: 'BULL-HARAMI',
    BEARISH_HAMMER: 'BEAR-HAMMER',
    BULLISH_HAMMER: 'BULL-HAMMER',
    BEARISH_ENGULFING: 'BEAR-ENGULF',
    BULLISH_ENGULFING: 'BULL-ENGULF',
    BEARISH_MARUBOZU: 'BEAR-MARUBOZU',
    BULLISH_MARUBOZU: 'BULL-MARUBOZU',
    BEARISH_HARAMI_CROSS: 'BEAR-HARAMI-X',
    BULLISH_HARAMI_CROSS: 'BULL-HARAMI-X',
    BEARISH_SPINNING_TOP: 'BEAR-SPIN-TOP',
    BULLISH_SPINNING_TOP: 'BULL-SPIN-TOP',
    BEARISH_INVERTED_HAMMER: 'BEAR-INVERTED-HAMMER',
    BULLISH_INVERTED_HAMMER: 'BULL-INVERTED-HAMMER',
    THREE_WHITE_SOLDIERS: '3-WHITE-SOLDIERS',
    THREE_BLACK_CROWS: '3-BLACK-CROWS',
    EVENING_DOJI_STAR: 'EVENING-DOJI-STAR',
    MORNING_DOJI_STAR: 'MORNING-DOJI-STAR',
    HAMMER_UNCONFIRMED: 'HAMMER-UNCONF',
    EVENING_STAR: 'EVENING-STAR',
    MORNING_STAR: 'MORNING-STAR',
    PIERCING_LINE: 'PIERCING-LINE',
    DRAGONFLY_DOJI: 'DRAGONFLY-DOJI',
    GRAVESTONE_DOJI: 'GRAVESTONE-DOJI',
    DARK_CLOUD_COVER: 'DARK-CLOUD-COVER',
    DOWNSIDE_TASUKI_GAP: 'DOWNSIDE-TASUKI-GAP',
    HANGING_MAN_UNCONFIRMED: 'HANGMAN-UNCONF',
    SHOOTING_STAR_UNCONFIRMED: 'SHOOT-START-UNCONF',
}
exports.INDEX_KEYS = INDEX_KEYS

exports.getAnalysisIndexes = _ => {
    return {
        [INDEX_KEYS.RSI]: { params: 'period', name: 'RSI' },
        [INDEX_KEYS.MACD]: { params: 'fast,slow,signal', name: 'MACD' },
        [INDEX_KEYS.SMA]: { params: 'period', name: 'SMA' },
        [INDEX_KEYS.EMA]: { params: 'period', name: 'EMA' },
        [INDEX_KEYS.STOCH_RSI]: { params: 'd,k,rsi,stoch', name: 'Stochastic RSI' },
        [INDEX_KEYS.BOLLINGER_BANDS]: { params: 'period,stdDev', name: 'Bollinger Bands (BB)' },
        [INDEX_KEYS.ADL]: { params: 'none', name: 'ADL' },
        [INDEX_KEYS.ADX]: { params: 'period', name: 'ADX' },
        [INDEX_KEYS.ATR]: { params: 'period', name: 'ATR' },
        [INDEX_KEYS.AWESOME_OSCILLATOR]: { params: 'fast,slow', name: 'Awesome Oscillator' },
        [INDEX_KEYS.CCI]: { params: 'period', name: 'CCI' },
        [INDEX_KEYS.FORCE_INDEX]: { params: 'period', name: 'Force Index' },
        [INDEX_KEYS.KST]: { params: 'roc1,roc2,roc3,roc4,smaroc1,smaroc2,smaroc3,smaroc4,signal', name: 'KST' },
        [INDEX_KEYS.MFI]: { params: 'period', name: 'MFI' },
        [INDEX_KEYS.OBV]: { params: 'none', name: 'OBV' },
        [INDEX_KEYS.PSAR]: { params: 'step,max', name: 'PSAR' },
        [INDEX_KEYS.ROC]: { params: 'period', name: 'ROC' },
        [INDEX_KEYS.STOCH]: { params: 'period,signal', name: 'Stochastic' },
        [INDEX_KEYS.TRIX]: { params: 'period', name: 'TRIX' },
        [INDEX_KEYS.VWAP]: { params: 'none', name: 'VWAP' },
        [INDEX_KEYS.VOLUME_PROFILE]: { params: 'bars', name: 'Volume Profile' },
        [INDEX_KEYS.WMA]: { params: 'period', name: 'WMA' },
        [INDEX_KEYS.WEMA]: { params: 'period', name: 'WEMA' },
        [INDEX_KEYS.WILLIAMS_R]: { params: 'period', name: 'Williams R' },
        [INDEX_KEYS.ICHIMOKU]: { params: 'conversion,base,span,displacement', name: 'Ichimoku' },
        [INDEX_KEYS.ABANDONED_BABY]: { params: 'none', name: 'Abandoned Baby' },
        [INDEX_KEYS.BEARISH_ENGULFING]: { params: 'none', name: 'Bearish Engulfing' },
        [INDEX_KEYS.BULLISH_ENGULFING]: { params: 'none', name: 'Bullish Engulfing' },
        [INDEX_KEYS.DARK_CLOUD_COVER]: { params: 'none', name: 'Dark Cloud Cover' },
        [INDEX_KEYS.DOWNSIDE_TASUKI_GAP]: { params: 'none', name: 'Downside Tasuki Gap' },
        [INDEX_KEYS.DOJI]: { params: 'none', name: 'Doji' },
        [INDEX_KEYS.DRAGONFLY_DOJI]: { params: 'none', name: 'DragonFly Doji' },
        [INDEX_KEYS.GRAVESTONE_DOJI]: { params: 'none', name: 'GraveStone Doji' },
        [INDEX_KEYS.BEARISH_HARAMI]: { params: 'none', name: 'Bearish Harami' },
        [INDEX_KEYS.BEARISH_HARAMI_CROSS]: { params: 'none', name: 'Bearish Harami Cross (X)' },
        [INDEX_KEYS.BULLISH_HARAMI]: { params: 'none', name: 'Bullish Harami' },
        [INDEX_KEYS.BULLISH_HARAMI_CROSS]: { params: 'none', name: 'Bullish Harami Cross (X)' },
        [INDEX_KEYS.BULLISH_MARUBOZU]: { params: 'none', name: 'Bullish Marubozu' },
        [INDEX_KEYS.BEARISH_MARUBOZU]: { params: 'none', name: 'Bearish Marubozu' },
        [INDEX_KEYS.EVENING_DOJI_STAR]: { params: 'none', name: 'Evening Doji Star' },
        [INDEX_KEYS.EVENING_STAR]: { params: 'none', name: 'Evening Star' },
        [INDEX_KEYS.PIERCING_LINE]: { params: 'none', name: 'Piercing Line' },
        [INDEX_KEYS.BULLISH_SPINNING_TOP]: { params: 'none', name: 'Bullish Spinning Top' },
        [INDEX_KEYS.BEARISH_SPINNING_TOP]: { params: 'none', name: 'Bearish Spinning Top' },
        [INDEX_KEYS.MORNING_DOJI_STAR]: { params: 'none', name: 'Morning Doji Star' },
        [INDEX_KEYS.MORNING_STAR]: { params: 'none', name: 'Morning Star' },
        [INDEX_KEYS.THREE_BLACK_CROWS]: { params: 'none', name: '3 Black Crows' },
        [INDEX_KEYS.THREE_WHITE_SOLDIERS]: { params: 'none', name: '3 White Soldiers' },
        [INDEX_KEYS.BULLISH_HAMMER]: { params: 'none', name: 'Bullish Hammer' },
        [INDEX_KEYS.BEARISH_HAMMER]: { params: 'none', name: 'Bearish Hammer' },
        [INDEX_KEYS.BULLISH_INVERTED_HAMMER]: { params: 'none', name: 'Bullish Inverted Hammer' },
        [INDEX_KEYS.BEARISH_INVERTED_HAMMER]: { params: 'none', name: 'Bullish Inverted Hammer' },
        [INDEX_KEYS.HAMMER]: { params: 'none', name: 'Hammer' },
        [INDEX_KEYS.HAMMER_UNCONFIRMED]: { params: 'none', name: 'Hammer (Unconf.)' },
        [INDEX_KEYS.HANGING_MAN]: { params: 'none', name: 'Hanging Man' },
        [INDEX_KEYS.HANGING_MAN_UNCONFIRMED]: { params: 'none', name: 'Haning Man (Unconf.)' },
        [INDEX_KEYS.SHOOTING_STAR]: { params: 'none', name: 'Shooting Star' },
        [INDEX_KEYS.SHOOTING_STAR_UNCONFIRMED]: { params: 'none', name: 'Shooting Star (Unconf.)' },
        [INDEX_KEYS.TWEEZER_TOP]: { params: 'none', name: 'Tweezer Top' },
        [INDEX_KEYS.TWEEZER_BOTTOM]: { params: 'none', name: 'Tweezer Bottom' },
        [INDEX_KEYS.INSIDE_CANDLE]: { params: 'bars', name: 'Inside Candle' },
    }
}

function abandonedBaby(ohlc) {
    const input = getThreeCandles(ohlc)
    return technicalindicators.abandonedbaby(input)
}

function bullishEngulfing(ohlc) {
    const input = getTwoCandles(ohlc)
    return technicalindicators.bullishengulfingpattern(input)
}

function bearishEngulfing(ohlc) {
    const input = getTwoCandles(ohlc)
    return technicalindicators.bearishEngulfing(input)
}

function darkCloudCover(ohlc) {
    const input = getTwoCandles(ohlc)
    return technicalindicators.darkcloudcover(input)
}

function downsideTasukiGap(ohlc) {
    const input = getThreeCandles(ohlc)
    return technicalindicators.downsidetasukigap(input)
}

function doji(ohlc) {
    const input = getOneCandle(ohlc)
    return technicalindicators.doji(input)
}

function dragonflyDoji(ohlc) {
    const input = getOneCandle(ohlc)
    return technicalindicators.dragonflydoji(input)
}

function graveStoneDoji(ohlc) {
    const input = getOneCandle(ohlc)
    return technicalindicators.gravestonedoji(input)
}

function bearishHarami(ohlc) {
    const input = getTwoCandles(ohlc)
    return technicalindicators.bearishharami(input)
}

function bullishHarami(ohlc) {
    const input = getTwoCandles(ohlc)
    return technicalindicators.bullishharami(input)
}

function bullishHaramiCross(ohlc) {
    const input = getTwoCandles(ohlc)
    return technicalindicators.bullishharamicross(input)
}

function bearishHaramiCross(ohlc) {
    const input = getTwoCandles(ohlc)
    return technicalindicators.bearishharamicross(input)
}

function bullishMarubozu(ohlc) {
    const input = getOneCandle(ohlc)
    return technicalindicators.bullishmarubozu(input)
}

function bearishMarubozu(ohlc) {
    const input = getOneCandle(ohlc)
    return technicalindicators.bearishmarubozu(input)
}

function eveningDojiStar(ohlc) {
    const input = getThreeCandles(ohlc)
    return technicalindicators.eveningdojistar(input)
}

function eveningStar(ohlc) {
    const input = getThreeCandles(ohlc)
    return technicalindicators.eveningstar(input)
}

function piercingLine(ohlc) {
    const input = getTwoCandles(ohlc)
    return technicalindicators.piercingline(input)
}

function bullishSpinningTop(ohlc) {
    const input = getOneCandle(ohlc)
    return technicalindicators.bullishspinningtop(input)
}

function bearishSpinningTop(ohlc) {
    const input = getOneCandle(ohlc)
    return technicalindicators.bearishspinningtop(input)
}

function morningDojiStar(ohlc) {
    const input = getThreeCandles(ohlc)
    return technicalindicators.morningdojistar(input)
}

function morningStar(ohlc) {
    const input = getThreeCandles(ohlc)
    return technicalindicators.morningstar(input)
}

function threeBlackCrows(ohlc) {
    const input = getThreeCandles(ohlc)
    return technicalindicators.threeblackcrows(input)
}

function threeWhiteSoldiers(ohlc) {
    const input = getThreeCandles(ohlc)
    return technicalindicators.threewhitesoldiers(input)
}

function bullishHammer(ohlc) {
    const input = getOneCandle(ohlc)
    return technicalindicators.bullishhammerstick(input)
}

function bearishHammer(ohlc) {
    const input = getOneCandle(ohlc)
    return technicalindicators.bearishhammerstick(input)
}

function bearishInvertedHammer(ohlc) {
    const input = getOneCandle(ohlc)
    return technicalindicators.bearishinvertedhammerstick(input)
}

function bullishInvertedHammer(ohlc) {
    const input = getOneCandle(ohlc)
    return technicalindicators.bullishinvertedhammerstick(input)
}

function hammer(ohlc) {
    const input = getFiveCandles(ohlc)
    return technicalindicators.hammerpattern(input)
}

function hammerUnconfirmed(ohlc) {
    const input = getFiveCandles(ohlc)
    return technicalindicators.hammerpatternunconfirmed(input)
}

function hangingMan(ohlc) {
    const input = getFiveCandles(ohlc)
    return technicalindicators.hangingman(input)
}

function hangingManUnconfirmed(ohlc) {
    const input = getFiveCandles(ohlc)
    return technicalindicators.hangingmanunconfirmed(input)
}

function shootingStar(ohlc) {
    const input = getFiveCandles(ohlc)
    return technicalindicators.shootingstar(input)
}

function shootingStarUnconfirmed(ohlc) {
    const input = getFiveCandles(ohlc)
    return technicalindicators.shootingstarunconfirmed(input)
}

function tweezerTop(ohlc) {
    const input = getFiveCandles(ohlc)
    return technicalindicators.tweezertop(input)
}

function tweezerBottom(ohlc) {
    const input = getFiveCandles(ohlc)
    return technicalindicators.tweezerbottom(input)
}

function getFiveCandles(ohlc) {
    const last = ohlc.high.length - 1
    return {
        open: [ohlc.open[last], ohlc.open[last - 1], ohlc.open[last - 2], ohlc.open[last - 3], ohlc.open[last - 4]],
        close: [ohlc.close[last], ohlc.close[last - 1], ohlc.close[last - 2], ohlc.close[last - 3], ohlc.close[last - 4]],
        high: [ohlc.high[last], ohlc.high[last - 1], ohlc.high[last - 2], ohlc.high[last - 3], ohlc.high[last - 4]],
        low: [ohlc.low[last], ohlc.low[last - 1], ohlc.low[last - 2], ohlc.low[last - 3], ohlc.low[last - 4]],
        volume: [ohlc.volume[last], ohlc.volume[last - 1], ohlc.volume[last - 2], ohlc.volume[last - 3], ohlc.volume[last - 4]],
    }
}

function getThreeCandles(ohlc) {
    const last = ohlc.high.length - 1
    return {
        open: [ohlc.open[last], ohlc.open[last - 1], ohlc.open[last - 2]],
        close: [ohlc.close[last], ohlc.close[last - 1], ohlc.close[last - 2]],
        high: [ohlc.high[last], ohlc.high[last - 1], ohlc.high[last - 2]],
        low: [ohlc.low[last], ohlc.low[last - 1], ohlc.low[last - 2]],
        volume: [ohlc.volume[last], ohlc.volume[last - 1], ohlc.volume[last - 2]],
    }
}

function getTwoCandles(ohlc) {
    const last = ohlc.high.length - 1
    return {
        open: [ohlc.open[last], ohlc.open[last - 1]],
        close: [ohlc.close[last], ohlc.close[last - 1]],
        high: [ohlc.high[last], ohlc.high[last - 1]],
        low: [ohlc.low[last], ohlc.low[last - 1]],
        volume: [ohlc.volume[last], ohlc.volume[last - 1]],
    }
}

function getOneCandle(ohlc) {
    const last = ohlc.high.length - 1
    return {
        open: [ohlc.open[last]],
        close: [ohlc.close[last]],
        high: [ohlc.high[last]],
        low: [ohlc.low[last]],
        volume: [ohlc.volume[last]],
    }
}

function ADL(ohlc) {
    const result = technicalindicators.adl(ohlc)
    return {
        current: result[result.length - 1],
        previous: result[result.length - 2]
    }
}

function ADX(ohlc, period) {
    const result = technicalindicators.adx({
        high: ohlc.high,
        low: ohlc.low,
        close: ohlc.close,
        period: parseInt(period) || 14
    })
    return {
        current: result[result.length - 1],
        previous: result[result.length - 2]
    }
}

function ATR(ohlc, period) {
    const result = technicalindicators.atr({
        high: ohlc.high,
        low: ohlc.low,
        close: ohlc.close,
        period: parseInt(period) || 14
    })
    return {
        current: result[result.length - 1],
        previous: result[result.length - 2]
    }
}

function AO(ohlc, fast, slow) {
    const result = technicalindicators.awesomeoscillator({
        high: ohlc.high,
        low: ohlc.low,
        fastPeriod: parseInt(fast) || 5,
        slowPeriod: parseInt(slow) || 34
    })
    return {
        current: result[result.length - 1],
        previous: result[result.length - 2]
    }
}

function CCI(ohlc, period) {
    const result = technicalindicators.cci({
        open: ohlc.open,
        high: ohlc.high,
        low: ohlc.low,
        close: ohlc.close,
        period: parseInt(period) || 20
    })
    return {
        current: result[result.length - 1],
        previous: result[result.length - 2]
    }
}

function FI(ohlc, period) {
    const result = technicalindicators.forceindex({
        open: ohlc.open,
        high: ohlc.high,
        low: ohlc.low,
        close: ohlc.close,
        volume: ohlc.volume,
        period: parseInt(period) || 1
    })
    return {
        current: result[result.length - 1],
        previous: result[result.length - 2]
    }
}

function KST(closes, rocPer1, rocPer2, rocPer3, rocPer4, smarocPer1, smarocPer2, smarocPer3, smarocPer4, signal) {
    const result = technicalindicators.kst({
        values: closes,
        ROCPer1: parseInt(rocPer1) || 10,
        ROCPer2: parseInt(rocPer2) || 15,
        ROCPer3: parseInt(rocPer3) || 20,
        ROCPer4: parseInt(rocPer4) || 30,
        SMAROCPer1: parseInt(smarocPer1) || 10,
        SMAROCPer2: parseInt(smarocPer2) || 10,
        SMAROCPer3: parseInt(smarocPer3) || 10,
        SMAROCPer4: parseInt(smarocPer4) || 15,
        signalPeriod: parseInt(signal) || 3,
    })
    return {
        current: result[result.length - 1],
        previous: result[result.length - 2]
    }
}

function MFI(ohlc, period) {
    const result = technicalindicators.mfi({
        high: ohlc.high,
        low: ohlc.low,
        close: ohlc.close,
        volume: ohlc.volume,
        period: parseInt(period) || 14
    })
    return {
        current: result[result.length - 1],
        previous: result[result.length - 2]
    }
}

function OBV(ohlc) {
    const result = technicalindicators.obv({
        close: ohlc.close,
        volume: ohlc.volume
    })
    return {
        current: result[result.length - 1],
        previous: result[result.length - 2]
    }
}

function PSAR(ohlc, step, max) {
    const result = technicalindicators.psar({
        high: ohlc.high,
        low: ohlc.low,
        step: parseFloat(step) || 0.02,
        max: parseFloat(max) || 0.2
    })
    return {
        current: result[result.length - 1],
        previous: result[result.length - 2]
    }
}

function ROC(closes, period) {
    const result = technicalindicators.roc({
        period: parseInt(period) || 12,
        values: closes
    })
    return {
        current: result[result.length - 1],
        previous: result[result.length - 2]
    }
}

function Stochastic(ohlc, period, signal) {
    const result = technicalindicators.stochastic({
        high: ohlc.high,
        low: ohlc.low,
        close: ohlc.close,
        period: parseInt(period) || 14,
        signalPeriod: signal || 3
    })
    return {
        current: result[result.length - 1],
        previous: result[result.length - 2]
    }
}

function TRIX(closes, period) {
    const result = technicalindicators.trix({
        period: parseInt(period) || 18,
        values: closes
    })
    return {
        current: result[result.length - 1],
        previous: result[result.length - 2]
    }
}

function VWAP(ohlc) {
    const result = technicalindicators.vwap(ohlc)
    return {
        current: result[result.length - 1],
        previous: result[result.length - 2]
    }
}

function VP(ohlc, bars) {
    const result = technicalindicators.volumeprofile({
        open: ohlc.open,
        high: ohlc.high,
        low: ohlc.low,
        close: ohlc.close,
        volume: ohlc.volume,
        noOfBars: parseInt(bars) || 14
    })
    return {
        current: result[result.length - 1],
        previous: result[result.length - 2]
    }
}

function williamsR(ohlc, period) {
    const result = technicalindicators.williamsr({
        open: ohlc.open,
        high: ohlc.high,
        low: ohlc.low,
        close: ohlc.close,
        period: parseInt(period) || 14
    })
    return {
        current: result[result.length - 1],
        previous: result[result.length - 2]
    }
}

function ichimoku(ohlc, conversion, base, span, displacement) {
    const result = technicalindicators.ichimokucloud({
        high: ohlc.high,
        low: ohlc.low,
        conversionPeriod: parseInt(conversion) || 9,
        basePeriod: parseInt(base) || 26,
        span: parseInt(span) || 52,
        displacement: parseInt(displacement) || 26
    })
    return {
        current: result[result.length - 1],
        previous: result[result.length - 2]
    }
}

function WMA(closes, period) {
    const result = technicalindicators.wma({
        period: parseInt(period) || 8,
        values: closes
    })
    return {
        current: result[result.length - 1],
        previous: result[result.length - 2]
    }
}

function WEMA(closes, period) {
    const result = technicalindicators.wema({
        period: parseInt(period) || 5,
        values: closes
    })
    return {
        current: result[result.length - 1],
        previous: result[result.length - 2]
    }
}

function RSI(closes, period = 14) {
    const result = technicalindicators.rsi({
        period: parseInt(period),
        values: closes
    })
    return {
        current: parseFloat(result[result.length - 1]),
        previous: parseFloat(result[result.length - 2]),
    }
}

function MACD(closes, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    const result = technicalindicators.macd({
        values: closes,
        SimpleMAOscillator: false,
        SimpleMASignal: false,
        fastPeriod: parseInt(fastPeriod),
        slowPeriod: parseInt(slowPeriod),
        signalPeriod: parseInt(signalPeriod)
    })
    return {
        current: result[result.length - 1],
        previous: result[result.length - 2]
    }
}

function StochRSI(closes, dPeriod = 3, kPeriod = 3, rsiPeriod = 14, stochasticPeriod = 14) {
    const result = technicalindicators.stochasticrsi({
        dPeriod: parseInt(dPeriod),
        kPeriod: parseInt(kPeriod),
        rsiPeriod: parseInt(rsiPeriod),
        stochasticPeriod: parseInt(stochasticPeriod),
        values: closes
    })
    return {
        current: result[result.length - 1],
        previous: result[result.length - 2]
    }
}

function bollingerBands(closes, period = 20, stdDev = 2) {
    console.log('!!! period', period, typeof period)

    const result = technicalindicators.bollingerbands({
        period: parseInt(period),
        stdDev: parseInt(stdDev),
        values: closes
    })
    return {
        current: result[result.length - 1],
        previous: result[result.length - 2]
    }
}

function SMA(closes, period = 10) {
    const result = technicalindicators.sma({
        values: closes,
        period: parseInt(period)
    })
    return {
        current: result[result.length - 1],
        previous: result[result.length - 2],
    }
}

function EMA(closes, period = 10) {
    const result = technicalindicators.ema({
        values: closes,
        period: parseInt(period)
    })
    return {
        current: result[result.length - 1],
        previous: result[result.length - 2],
    }
}

function insideCandle(ohlc, bars = 12) {
    const last = ohlc.high.length - 1
    let hasInsideCandle = ohlc.high[last] < ohlc.high[last - 1] && ohlc.low[last] > ohlc.low[last - 1]
    if (hasInsideCandle && bars > 1) {
        for (let i = 1; i < bars; i++) {
            hasInsideCandle = ohlc.high[last - i] < ohlc.high[last - i - 1] && ohlc.low[last - i] > ohlc.low[last - i - 1]
            if (!hasInsideCandle) {
                break
            }
        }
    }
    return hasInsideCandle
}

function calcIndex(index, ohlc) {
    const params = index.split('_').splice(0, 1)
    const indexName = params[0]

    switch (indexName) {
        case INDEX_KEYS.ADL: return ADL(ohlc)
        case INDEX_KEYS.ADX: return ADX(ohlc, ...params)
        case INDEX_KEYS.ATR: return ATR(ohlc, ...params)
        case INDEX_KEYS.CCI: return CCI(ohlc, ...params)
        case INDEX_KEYS.EMA: return EMA(ohlc.close, ...params)
        case INDEX_KEYS.KST: return KST(ohlc.close, ...params)
        case INDEX_KEYS.MFI: return MFI(ohlc, ...params)
        case INDEX_KEYS.OBV: return OBV(ohlc)
        case INDEX_KEYS.ROC: return ROC(ohlc.close, ...params)
        case INDEX_KEYS.RSI: return RSI(ohlc.close, ...params)
        case INDEX_KEYS.SMA: return SMA(ohlc.close, ...params)
        case INDEX_KEYS.WMA: return WMA(ohlc.close, ...params)
        case INDEX_KEYS.DOJI: return doji(ohlc)
        case INDEX_KEYS.MACD: return MACD(ohlc.close, ...params)
        case INDEX_KEYS.PSAR: return PSAR(ohlc, ...params)
        case INDEX_KEYS.TRIX: return TRIX(ohlc.close, ...params)
        case INDEX_KEYS.VWAP: return VWAP(ohlc)
        case INDEX_KEYS.WEMA: return WEMA(ohlc.close, ...params)
        case INDEX_KEYS.STOCH: return Stochastic(ohlc, ...params)
        case INDEX_KEYS.HAMMER: return hammer(ohlc)
        case INDEX_KEYS.EVENING_STAR: return eveningStar(ohlc)
        case INDEX_KEYS.INSIDE_CANDLE: return insideCandle(ohlc, ...params)
        case INDEX_KEYS.PIERCING_LINE: return piercingLine(ohlc)
        case INDEX_KEYS.BEARISH_HARAMI: return bearishHarami(ohlc)
        case INDEX_KEYS.BULLISH_HARAMI: return bullishHarami(ohlc)
        case INDEX_KEYS.ABANDONED_BABY: return abandonedBaby(ohlc)
        case INDEX_KEYS.BULLISH_MARUBOZU: return bullishMarubozu(ohlc)
        case INDEX_KEYS.BEARISH_MARUBOZU: return bearishMarubozu(ohlc)
        case INDEX_KEYS.BEARISH_ENGULFING: return bearishEngulfing(ohlc)
        case INDEX_KEYS.MORNING_DOJI_STAR: return morningDojiStar(ohlc)
        case INDEX_KEYS.EVENING_DOJI_STAR: return eveningDojiStar(ohlc)
        case INDEX_KEYS.AWESOME_OSCILLATOR: return AO(ohlc, ...params)
        case INDEX_KEYS.BEARISH_HARAMI_CROSS: return bearishHaramiCross(ohlc)
        case INDEX_KEYS.BULLISH_HARAMI_CROSS: return bullishHaramiCross(ohlc)
        case INDEX_KEYS.BULLISH_SPINNING_TOP: return bullishSpinningTop(ohlc)
        case INDEX_KEYS.BEARISH_SPINNING_TOP: return bearishSpinningTop(ohlc)
        case INDEX_KEYS.MORNING_STAR: return morningStar(ohlc)
        case INDEX_KEYS.THREE_BLACK_CROWS: return threeBlackCrows(ohlc)
        case INDEX_KEYS.THREE_WHITE_SOLDIERS: return threeWhiteSoldiers(ohlc)
        case INDEX_KEYS.BULLISH_HAMMER: return bullishHammer(ohlc)
        case INDEX_KEYS.BEARISH_HAMMER: return bearishHammer(ohlc)
        case INDEX_KEYS.HAMMER_UNCONFIRMED: return hammerUnconfirmed(ohlc)
        case INDEX_KEYS.HANGING_MAN: return hangingMan(ohlc)
        case INDEX_KEYS.SHOOTING_STAR: return shootingStar(ohlc)
        case INDEX_KEYS.ICHIMOKU: return ichimoku(ohlc, ...params)
        case INDEX_KEYS.STOCH_RSI: return StochRSI(ohlc.close, ...params)
        case INDEX_KEYS.WILLIAMS_R: return williamsR(ohlc, ...params)
        case INDEX_KEYS.TWEEZER_TOP: return tweezerTop(ohlc)
        case INDEX_KEYS.FORCE_INDEX: return FI(ohlc, ...params)
        case INDEX_KEYS.VOLUME_PROFILE: return VP(ohlc, ...params)
        case INDEX_KEYS.TWEEZER_BOTTOM: return tweezerBottom(ohlc)
        case INDEX_KEYS.DRAGONFLY_DOJI: return dragonflyDoji(ohlc)
        case INDEX_KEYS.GRAVESTONE_DOJI: return graveStoneDoji(ohlc)
        case INDEX_KEYS.BOLLINGER_BANDS: return "Error"//bollingerBands(ohlc.close, ...params)
        case INDEX_KEYS.DARK_CLOUD_COVER: return darkCloudCover(ohlc)
        case INDEX_KEYS.BULLISH_ENGULFING: return bullishEngulfing(ohlc)
        case INDEX_KEYS.DOWNSIDE_TASUKI_GAP: return downsideTasukiGap(ohlc)
        case INDEX_KEYS.BULLISH_INVERTED_HAMMER: return bullishInvertedHammer(ohlc)
        case INDEX_KEYS.BEARISH_INVERTED_HAMMER: return bearishInvertedHammer(ohlc)
        case INDEX_KEYS.HANGING_MAN_UNCONFIRMED: return hangingManUnconfirmed(ohlc)
        case INDEX_KEYS.SHOOTING_STAR_UNCONFIRMED: return shootingStarUnconfirmed(ohlc)
        default: throw new Error(`Unknown index name: ${indexName}`)
    }
}

exports.processIndexes = (indexes, ohlc, callback) => {
    indexes.map(index => {
        const calc = calcIndex(index, ohlc)
        callback(index, calc, !!calc.current)
    })
}
