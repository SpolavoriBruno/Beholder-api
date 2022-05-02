const { getBrain, getMemory } = require('../beholder')

exports.getMemory = (req, res) => (res.json(getMemory()))
exports.getBrain = (req, res) => (res.json(getBrain()))
