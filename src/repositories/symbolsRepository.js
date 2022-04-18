const symbolModel = require('../models/symbolModel')

exports.getSymbols = () => symbolModel.findAll()
exports.getSymbol = (symbol) => symbolModel.findOne({ where: { symbol } })
exports.updateSymbol = async (symbol, newSymbolData) => {
    const currentSymbol = await this.getSymbol(symbol)

    if (newSymbolData.basePrecision && newSymbolData.basePrecision !== currentSymbol.basePrecision)
        currentSymbol.basePrecision = newSymbolData.basePrecision

    if (newSymbolData.quotePrecision && newSymbolData.quotePrecision !== currentSymbol.quotePrecision)
        currentSymbol.quotePrecision = newSymbolData.quotePrecision

    if (newSymbolData.minNotional && newSymbolData.minNotional !== currentSymbol.minNotional)
        currentSymbol.minNotional = newSymbolData.minNotional

    if (newSymbolData.minLotSize && newSymbolData.minLotSize !== currentSymbol.minLotSize)
        currentSymbol.minLotSize = newSymbolData.minLotSize

    if (newSymbolData.isFavorite !== undefined && newSymbolData.isFavorite !== currentSymbol.isFavorite)
        currentSymbol.isFavorite = newSymbolData.isFavorite

    if (newSymbolData.base !== undefined && newSymbolData.base !== currentSymbol.base)
        currentSymbol.base = newSymbolData.base

    if (newSymbolData.quote !== undefined && newSymbolData.quote !== currentSymbol.quote)
        currentSymbol.quote = newSymbolData.quote

    await currentSymbol.save()
}

exports.deleteAll = () => symbolModel.destroy({ truncate: true })

exports.bulkInsert = (symbols) => symbolModel.bulkCreate(symbols)
