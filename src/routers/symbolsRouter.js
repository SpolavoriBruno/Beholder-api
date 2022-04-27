const router = require('express').Router()
const { getSymbols, getSymbol, updateSymbol, syncSymbols } = require('../controllers/symbolsController.js')

router.get('/', getSymbols)
router.get('/:symbol', getSymbol)
router.patch('/:symbol', updateSymbol)
router.post('/sync', syncSymbols)
module.exports = router
