const router = require('express').Router()
const { getBrain, getMemory } = require('../controllers/beholderController')

router.get('/memory', getMemory)
router.get('/brain', getBrain)

module.exports = router
