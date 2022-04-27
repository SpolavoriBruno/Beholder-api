const router = require('express').Router()

const { getSettings, updateSettings } = require('../controllers/settingsController')

router.get('/', getSettings)

router.patch('/', updateSettings)

module.exports = router
