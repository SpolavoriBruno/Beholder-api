const router = require('express').Router()
const {
    getAutomation, getAutomations,
    startAutomation, stopAutomation,
    insertAutomation, updateAutomation,
    deleteAutomation,
} = require('../controllers/automationsController.js')

router.get('/:id', getAutomation)
router.get('/', getAutomations)
router.post('/:id/start', startAutomation)
router.post('/:id/stop', stopAutomation)
router.post('/', insertAutomation)
router.patch('/:id', updateAutomation)
router.delete('/:id', deleteAutomation)

module.exports = router
