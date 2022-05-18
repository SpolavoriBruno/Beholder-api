const actionModel = require('../models/actionModel')

exports.ACTIONS_TYPE = {
    ALERT_EMAIL: 'ALERT_EMAIL',
    ALERT_SMS: 'ALERT_SMS',
    ORDER: 'ORDER',
}

exports.insertActions = (action, transaction) => actionModel.bulkCreate(action, { transaction })

exports.deleteActions = (automationId, transaction) => actionModel.destroy({ where: { automationId }, transaction })

exports.getActionByOrderTemplateId = orderTemplateId => actionModel.findAll({ where: { orderTemplateId } })
