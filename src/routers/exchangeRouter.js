const express = require('express')
const { getBalance } = require('../controllers/exchangeController')

const router = express.Router()

router.get('/balance', getBalance)

module.exports = router
