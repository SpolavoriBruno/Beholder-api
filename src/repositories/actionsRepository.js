const actionModel = require('../models/actionModel')

exports.ACTIONS_TYPE = {
    ALERT_EMAIL: 'ALERT_EMAIL',
    ALERT_SMS: 'ALERT_SMS',
    ORDER: 'ORDER',
    WEBHOOK: 'WEBHOOK',
}

exports.insertActions = (actions, transaction) => {
    actions.map(action => {
        delete action.id
        return action
    })
    return actionModel.bulkCreate(actions, { transaction })
}

exports.deleteActions = (automationId, transaction) => actionModel.destroy({ where: { automationId }, transaction })

exports.getActionByOrderTemplateId = orderTemplateId => actionModel.findAll({ where: { orderTemplateId } })
