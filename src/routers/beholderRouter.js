const router = require('express').Router()
const { getBrain, getMemory, getMemoryIndexes, getBrainIndexes } = require('../controllers/beholderController')

router.get('/memory', getMemory)
router.get('/memory/indexes', getMemoryIndexes)
router.get('/brain', getBrain)
router.get('/brain/indexes', getBrainIndexes)

module.exports = router
