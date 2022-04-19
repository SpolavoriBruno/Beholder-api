const Sequelize = require('sequelize')
const db = require('../db')

const settingsModel = db.define('settings', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    apiUrl: Sequelize.STRING,
    streamUrl: Sequelize.STRING,
    accessKey: Sequelize.STRING,
    secretKey: Sequelize.STRING,
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
}, {
    indexes: [{
        fields: ['email'],
        unique: true
    }]
})

module.exports = settingsModel
