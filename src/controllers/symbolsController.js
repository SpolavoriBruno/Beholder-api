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

exports.syncSymbols = () => { }
