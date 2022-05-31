const { getBrain, getMemories, getMemoryIndexes, getBrainIndexes, getMemory } = require('../beholder')
const { getAnalysisIndexes } = require('../utils/indexes')

exports.getMemory = (req, res) => {
    const { symbol, index, interval } = req.params
    if (symbol)
        res.json(getMemory(
            symbol.toUpperCase(),
            index.toUpperCase(),
            interval
        ))

    else res.json(getMemories())
}
exports.getBrain = (req, res) => res.json(getBrain())
exports.getMemoryIndexes = (req, res) => {
    const { symbol, index, interval } = req.query
    res.json(getMemoryIndexes(symbol, index, interval))
}
exports.getBrainIndexes = (req, res) => res.json(getBrainIndexes())
exports.getAnalysisIndexes = (req, res) => res.json(getAnalysisIndexes())

