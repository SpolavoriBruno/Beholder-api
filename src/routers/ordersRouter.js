const router = require('express').Router()
const { getOrders, placeOrder, cancelOrder } = require('../controllers/ordersController')

router.get('/:symbol?', getOrders)
router.post('/', placeOrder)
router.delete('/:symbol/:orderId', cancelOrder)

module.exports = router
