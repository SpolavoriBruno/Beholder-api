const { getBrain, getMemories, getMemoryIndexes, getBrainIndexes } = require('../beholder')

exports.getMemory = (req, res) => (res.json(getMemories()))
exports.getBrain = (req, res) => (res.json(getBrain()))
exports.getMemoryIndexes = (req, res) => {
    const { symbol, index, interval } = req.query
    res.json(getMemoryIndexes(symbol, index, interval))
}
exports.getBrainIndexes = (req, res) => {
    res.json(getBrainIndexes())
}
