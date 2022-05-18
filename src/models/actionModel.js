const { QueryError } = require('sequelize')
const Sequelize = require('sequelize')
const db = require('../db')

const orderTemplateModel = require('./orderTemplateModel')

const actionModel = db.define('action', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    automationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    type: {
        type: Sequelize.STRING,
        allowNull: false
    },
    orderTemplateId: Sequelize.INTEGER,
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
})

actionModel.belongsTo(orderTemplateModel, {
    foreignKey: 'orderTemplateId',
    onDelete: 'SET NULL'
})

module.exports = actionModel
