const express = require('express')
const { getSymbols, getSymbol, updateSymbol, syncSymbols } = require('../controllers/symbolsController.js')

const router = express.Router()

router.get('/', getSymbols)
router.get('/:symbol', getSymbol)
router.patch('/:symbol', updateSymbol)
router.post('/sync', syncSymbols)
module.exports = router
