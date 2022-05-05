const router = require('express').Router()
const {
    getMonitor, getMonitors,
    startMonitor, stopMonitor,
    insertMonitor, updateMonitor,
    deleteMonitor, getMonitorTypes,
} = require('../controllers/monitorsController.js')

router.get('/types', getMonitorTypes)
router.get('/:id', getMonitor)
router.get('/', getMonitors)
router.post('/:id/start', startMonitor)
router.post('/:id/stop', stopMonitor)
router.post('/', insertMonitor)
router.patch('/:id', updateMonitor)
router.delete('/:id', deleteMonitor)

module.exports = router
