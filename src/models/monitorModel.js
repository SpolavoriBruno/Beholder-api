const { QueryError } = require('sequelize')
const Sequelize = require('sequelize')
const db = require('../db')

const monitorModel = db.define('monitor', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    symbol: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: '*'
    },
    type: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    broadcastLabel: Sequelize.STRING,
    interval: Sequelize.STRING,
    indexes: Sequelize.STRING,
    isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    isSystemMon: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    logs: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
}, {
    indexes: [{
        fields: ['type', 'interval', 'symbol'],
        unique: true
    }, {
        fields: ['symbol']
    }]
})

module.exports = monitorModel
