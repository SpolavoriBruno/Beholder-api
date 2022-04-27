const { QueryError } = require('sequelize')
const Sequelize = require('sequelize')
const db = require('../db')

const orderModel = db.define('order', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    automationId: Sequelize.INTEGER,
    symbol: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    orderId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    clientOrderId: {
        type: Sequelize.STRING,
        allowNull: false
    },
    transactTime: {
        type: Sequelize.BIGINT,
        allowNull: false
    },
    type: {
        type: Sequelize.STRING,
        allowNull: false
    },
    side: {
        type: Sequelize.STRING,
        allowNull: false
    },
    status: {
        type: Sequelize.STRING,
        allowNull: false
    },
    quantity: {
        type: Sequelize.STRING,
        allowNull: false
    },
    icebergQuantity: Sequelize.STRING,
    isMaker: Sequelize.BOOLEAN,
    limitPrice: Sequelize.STRING,
    stopPrice: Sequelize.STRING,
    avgPrive: Sequelize.DECIMAL,
    commission: Sequelize.STRING,
    net: Sequelize.DECIMAL,
    obs: Sequelize.STRING,
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
}, {
    indexes: [{
        fields: ['clientOrderId', 'orderId'],
        unique: true
    }, {
        fields: ['symbol']
    }]
})

module.exports = orderModel
