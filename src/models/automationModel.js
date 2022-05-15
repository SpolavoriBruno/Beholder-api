const { QueryError } = require('sequelize')
const Sequelize = require('sequelize')
const db = require('../db')
const actionModel = require('./actionModel')

const automationModel = db.define('automation', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    symbol: {
        type: Sequelize.STRING,
        allowNull: false
    },
    indexes: {
        type: Sequelize.STRING,
        allowNull: false
    },
    conditions: {
        type: Sequelize.STRING,
        allowNull: false
    },
    isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
    },
    logs: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
    },
    coolDown: Sequelize.STRING,
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
}, {
    indexes: [{
        fields: ['symbol', 'name'],
        unique: true
    }]
})

automationModel.hasMany(actionModel, {
    foreignKey: 'automationId',
    onDelete: 'CASCADE'
})

module.exports = automationModel
