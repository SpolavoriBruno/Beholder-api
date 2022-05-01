const router = require('express').Router()
const { getOrders, placeOrder, cancelOrder, syncOrder } = require('../controllers/ordersController')

router.get('/:symbol?', getOrders)
router.post('/', placeOrder)
router.post('/sync/:id', syncOrder)
router.delete('/:symbol/:orderId', cancelOrder)

module.exports = router
