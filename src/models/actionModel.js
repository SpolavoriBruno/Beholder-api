const { QueryError } = require('sequelize')
const Sequelize = require('sequelize')
const db = require('../db')

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
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
})

module.exports = actionModel
