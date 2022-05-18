const Sequelize = require('sequelize')
const symbolModel = require('../models/symbolModel')

const PAGE_SIZE = 10

exports.getSymbols = () => symbolModel.findAll()

exports.getSymbol = (symbol) => symbolModel.findOne({ where: { symbol } })

exports.searchSymbols = (symbol, onlyFavorites = false, page = 1) => {
    const options = {
        where: {},
        order: [['symbol', 'ASC']],
        limit: PAGE_SIZE,
        offset: PAGE_SIZE * (page - 1)
    }

    if (symbol) {
        if (symbol.length < 6)
            options.where.symbol = {
                [Sequelize.Op.like]: `%${symbol}%`
            }
        else
            options.where = { search: symbol }
    }

    if (onlyFavorites) options.where.isFavorite = true

    return symbolModel.findAndCountAll(options)
}

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

    if (newSymbolData.stepSize && newSymbolData.stepSize !== currentSymbol.stepSize)
        currentSymbol.stepSize = newSymbolData.stepSize

    if (newSymbolData.tickSize && newSymbolData.tickSize !== currentSymbol.tickSize)
        currentSymbol.tickSize = newSymbolData.tickSize

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
