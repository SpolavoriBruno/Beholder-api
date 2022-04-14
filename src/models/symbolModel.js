const Sequelize = require('sequelize')
const db = require('../db')

const symbolsModel = db.define('symbol', {
    symbol: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
    },
    basePrecision: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    quotePrecision: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    minNotional: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    minLotSize: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    isFavorite: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
})

module.exports = symbolsModel
