const Sequelize = require('sequelize')
const db = require('../db')

const orderTemplateModel = db.define('orderTemplate', {
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
        allowNull: false,
    },
    type: {
        type: Sequelize.STRING,
        allowNull: false
    },
    side: {
        type: Sequelize.STRING,
        allowNull: false
    },
    quantity: {
        type: Sequelize.STRING,
        allowNull: false
    },
    quantityMultiplier: Sequelize.DECIMAL(10, 4),
    limitPrice: Sequelize.STRING,
    limitPriceMultiplier: Sequelize.DECIMAL(10, 4),
    stopPrice: Sequelize.STRING,
    stopPriceMultiplier: Sequelize.DECIMAL(10, 4),
    icebergQty: Sequelize.STRING,
    icebergQtyMultiplier: Sequelize.STRING,
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
}, {
    indexes: [{
        fields: ['name', 'symbol'],
        unique: true
    }]
})

module.exports = orderTemplateModel
