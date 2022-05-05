const { getBrain, getMemories } = require('../beholder')

exports.getMemory = (req, res) => (res.json(getMemories()))
exports.getBrain = (req, res) => (res.json(getBrain()))
