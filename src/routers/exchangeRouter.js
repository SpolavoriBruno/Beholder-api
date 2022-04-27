const router = require('express').Router()
const { getBalance } = require('../controllers/exchangeController')

router.get('/balance', getBalance)

module.exports = router
