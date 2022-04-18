const { getSymbols, getSymbol, updateSymbol } = require('../repositories/symbolsRepository')
const logger = require('../utils/logger')

exports.getSymbols = (req, res) => {
    getSymbols()
        .then(symbols => res.json(symbols))
        .catch(error => {
            logger.error(error)
            res.status(500).json(error)
        })
}

exports.getSymbol = (req, res) => {
    const symbol = req.params.symbol
    getSymbol(symbol)
        .then(symbol => res.json(symbol))
        .catch(error => {
            logger.error(error)
            res.status(500).json(error)
        })
}

exports.updateSymbol = (req, res) => {
    const symbol = req.params.symbol
    const newSymbolData = req.body

    updateSymbol(symbol, newSymbolData)
        .then(() => res.sendStatus(200))
        .catch(error => {
            logger.error(error)
            res.status(500).json(error)
        })
}

exports.syncSymbols = async (req, res) => {
    const { getDecryptedSettings } = require('../repositories/settingsRepository')
    const { deleteAll, bulkInsert } = require('../repositories/symbolsRepository')

    const favoriteSymbols = (await getSymbols()).filter(s => s.isFavorite === true).map(s => s.symbol)
    const settings = await getDecryptedSettings(res.locals.token.id)

    const { exchangeInfo } = require('../utils/exchange')(settings.get({ plain: true }))
    exchangeInfo()
        .then(data => data.symbols.map(item => {
            const getSymbolFilter = (filter, collection) => collection.find(f => f.filterType === filter)

            const minNotional = getSymbolFilter('MIN_NOTIONAL', item.filters).minNotional
            const minLotSize = getSymbolFilter('LOT_SIZE', item.filters).minQty
            return {
                symbol: item.symbol,
                basePrecision: item.baseAssetPrecision,
                base: item.baseAsset,
                quotePrecision: item.quoteAssetPrecision,
                quote: item.quoteAsset,
                minNotional,
                minLotSize,
                isFavorite: favoriteSymbols.some(s => s === item.symbol),
            }
        }))
        .then(async symbols => {

            await deleteAll()
            await bulkInsert(symbols)
            res.sendStatus(201)
        })
}
