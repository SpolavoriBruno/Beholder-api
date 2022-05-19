const { getActionByOrderTemplateId } = require('../repositories/actionsRepository')
const { getOrderTemplate, getOrderTemplates, insertOrderTemplate, updateOrderTemplate, deleteOrderTemplate, } = require('../repositories/orderTemplateRepository')

const sanatizeOrderTemplate = orderTemplate => {
    orderTemplate.quantity = orderTemplate.quantity ? orderTemplate.quantity.replace(',', '.') : orderTemplate.quantity
    orderTemplate.quantityMultiplier = orderTemplate.quantityMultiplier ? orderTemplate.quantityMultiplier.replace(',', '.') : orderTemplate.quantityMultiplier
    orderTemplate.limitPriceMultiplier = orderTemplate.limitPriceMultiplier ? orderTemplate.limitPriceMultiplier.replace(',', '.') : orderTemplate.limitPriceMultiplier
    orderTemplate.stopPriceMultiplier = orderTemplate.stopPriceMultiplier ? orderTemplate.stopPriceMultiplier.replace(',', '.') : orderTemplate.stopPriceMultiplier
    orderTemplate.icebergQtyMultiplier = orderTemplate.icebergQtyMultiplier ? orderTemplate.icebergQtyMultiplier.replace(',', '.') : orderTemplate.icebergQtyMultiplier
}

exports.getOrderTemplate = (req, res) => {
    const id = req.params.id
    getOrderTemplate(id)
        .then(o => res.json(o))
}

exports.getOrderTemplates = (req, res) => {
    const symbol = req.params.symbol?.toUpperCase()
    const page = req.query.page
    getOrderTemplates(symbol, page)
        .then(o => res.json(o))
}

function validatePrice(price) {
    if (!price) return true
    if (parseFloat(price)) return true
    return /^(MEMORY\[\'[a-z0-9:_\-]+?\'\]([\.a-z]+)*)$/i.test(price)
}

exports.insertOrderTemplate = (req, res) => {
    const orderTemplate = req.body
    if (!validatePrice(orderTemplate.price) || !validatePrice(orderTemplate.stopPrice))
        return res.status(400).json(`Invalid price`)

    sanatizeOrderTemplate(orderTemplate)
    insertOrderTemplate(orderTemplate)
        .then(o => res.json(o))
        .catch(error => {
            if (error.status)
                return res.status(error.status).json(error.message)
            return res.status(500).json(error.message ? error.message : error)
        })
}

exports.updateOrderTemplate = (req, res) => {
    const id = req.params.id
    const orderTemplate = req.body

    sanatizeOrderTemplate(orderTemplate)
    updateOrderTemplate(id, orderTemplate)
        .then(o => res.status(200).json(o.get({ plain: true })))
        .catch(error => res.status(500).json(error))
}

exports.deleteOrderTemplate = (req, res) => {
    const id = req.params.id
    console.count(`Actions get by order template`)
    getActionByOrderTemplateId(id)
        .then(actions => {
            if (actions.length)
                return Promise.reject({
                    status: 409,
                    message: 'You cant delete and Order Template used by an Action'
                })

            return deleteOrderTemplate(id).then(_ => res.sendStatus(204))
        })
        .catch(error => {
            if (error.status === 409)
                return res.status(409).json(error.message)
            return res.status(500).json(error)
        })
}
