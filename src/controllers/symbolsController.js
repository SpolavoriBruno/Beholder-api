const { getSymbols, getSymbol, updateSymbol, searchSymbols } = require('../repositories/symbolsRepository')
const errorHandler = require('../utils/errorHandler')

exports.getSymbols = (req, res) => {

    const { search, page, onlyFavorites } = req.query

    let result
    if (search || page || onlyFavorites)
        result = searchSymbols(search, onlyFavorites, page)
    else
        result = getSymbols()

    result
        .then(data => res.json(data))
        .catch(e => errorHandler(e, (s, b) => res.status(s).json(b)))
}

exports.getSymbol = (req, res) => {
    const symbol = req.params.symbol
    getSymbol(symbol)
        .then(symbol => res.json(symbol))
        .catch(e => errorHandler(e, (s, b) => res.status(s).json(b)))
}

exports.updateSymbol = (req, res) => {
    const symbol = req.params.symbol
    const newSymbolData = req.body

    updateSymbol(symbol, newSymbolData)
        .then(() => res.sendStatus(200))
        .catch(e => errorHandler(e, (s, b) => res.status(s).json(b)))
}

exports.syncSymbols = async (req, res) => {
    const { getDecryptedSettings } = require('../repositories/settingsRepository')
    const { deleteAll, bulkInsert } = require('../repositories/symbolsRepository')

    const favoriteSymbols = (await getSymbols()).filter(s => s.isFavorite === true).map(s => s.symbol)
    const settings = await getDecryptedSettings(res.locals.token.id)

    const { exchangeInfo } = require('../utils/exchange')(settings.get({ plain: true }))
    // TODO: ckeck if exchangeInfo is used in somewhere else
    exchangeInfo()
        // move it in exchangeInfo ?
        .then(data => data.symbols.map(item => {
            const getSymbolFilter = (filter, collection) => collection.find(f => f.filterType === filter)

            const { minNotional } = getSymbolFilter('MIN_NOTIONAL', item.filters)
            const { minQty, stepSize } = getSymbolFilter('LOT_SIZE', item.filters)
            const { tickSize } = getSymbolFilter('PRICE_FILTER', item.filters)

            return {
                symbol: item.symbol,
                basePrecision: item.baseAssetPrecision,
                base: item.baseAsset,
                quotePrecision: item.quoteAssetPrecision,
                quote: item.quoteAsset,
                minNotional,
                minLotSize: minQty,
                stepSize,
                tickSize,
                isFavorite: favoriteSymbols.some(s => s === item.symbol),
            }
        }))
        .then(async symbols => {

            await deleteAll()
            await bulkInsert(symbols)
            res.sendStatus(201)
        })
        .catch(e => errorHandler(e, (s, b) => res.status(s).json(b)))
}
