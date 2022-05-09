const router = require('express').Router()
const { getBrain, getMemory, getMemoryIndexes } = require('../controllers/beholderController')

router.get('/memory', getMemory)
router.get('/memoryIndexes', getMemoryIndexes)
router.get('/brain', getBrain)

module.exports = router
