const { getSymbols, getSymbol, updateSymbol } = require('../repositories/symbolsRepository')

exports.getSymbols = (req, res) => {
    getSymbols()
        .then(symbols => res.json(symbols))
        .catch(error => {
            console.error(error)
            res.status(500).json(error)
        })
}

exports.getSymbol = (req, res) => {
    const symbol = req.params.symbol
    getSymbol(symbol)
        .then(symbol => res.json(symbol))
        .catch(error => {
            console.error(error)
            res.status(500).json(error)
        })
}


exports.updateSymbol = (req, res) => {
    const symbol = req.params.symbol
    const newSymbolData = req.body

    updateSymbol(symbol, newSymbolData)
        .then(() => res.sendStatus(200))
        .catch(error => {
            console.error(error)
            res.status(500).json(error)
        })
}

exports.syncSymbols = async (req, res) => {
    const crypto = require('../utils/crypto')
    const { getSettings } = require('../repositories/settingsRepository')

    const settings = await getSettings(res.locals.token.id)
    settings.secretKey = crypto.decrypt(settings.secretKey)

    const { exchangeInfo } = require('../utils/exchange')(settings.get({ plain: true }))
    exchangeInfo()
        .then(data => data.symbols.map(item => {
            const getSymbolFilter = (filter, collection) => collection.find(f => f.filterType === filter)

            const minNotional = getSymbolFilter('MIN_NOTIONAL', item.filters).minNotional
            const minLotSize = getSymbolFilter('LOT_SIZE', item.filters).minQty
            return {
                symbol: item.symbol,
                basePrecision: item.baseAssetPrecision,
                quotePrecision: item.quoteAssetPrecision,
                minNotional,
                minLotSize,
                isFavorite: false,
            }
        }))
        .then(async symbols => {
            const { deleteAll, bulkInsert } = require('../repositories/symbolsRepository')

            await deleteAll()
            await bulkInsert(symbols)
            console.log(symbols)
            res.sendStatus(201)
        })
}
