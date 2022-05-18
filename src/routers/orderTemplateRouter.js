const router = require('express').Router()
const { deleteOrderTemplate, getOrderTemplates, updateOrderTemplate, insertOrderTemplate } = require('../controllers/orderTemplateController')

// router.get('/:id', getOrderTemplate)
router.get('/:symbol?', getOrderTemplates)
router.patch('/:id', updateOrderTemplate)
router.post('/', insertOrderTemplate)
router.delete('/:id', deleteOrderTemplate)

module.exports = router
