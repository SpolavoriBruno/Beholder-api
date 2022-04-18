const express = require('express')
const { getBalance } = require('../controllers/exchangeController')

const router = express.Router()

router.get('/', getBalance)

module.exports = router
