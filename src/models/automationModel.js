const { QueryError } = require('sequelize')
const Sequelize = require('sequelize')
const db = require('../db')

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
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
}, {
    indexes: [{
        fields: ['symbol', 'name'],
        unique: true
    }]
})

module.exports = automationModel
