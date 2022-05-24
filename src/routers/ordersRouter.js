const router = require('express').Router()
const { getOrders, placeOrder, cancelOrder, syncOrder, getOrdersReport } = require('../controllers/ordersController')

router.get('/reports/:quote', getOrdersReport)
router.get('/:symbol?', getOrders)
router.post('/', placeOrder)
router.post('/sync/:id', syncOrder)
router.delete('/:symbol/:orderId', cancelOrder)

module.exports = router
