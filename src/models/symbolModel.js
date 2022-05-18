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
    base: Sequelize.STRING,
    quotePrecision: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    quote: Sequelize.STRING,
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
    stepSize: Sequelize.STRING,
    tickSize: Sequelize.STRING,
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
})

module.exports = symbolsModel
