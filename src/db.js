const Sequelize = require('sequelize')

const sequelize = new Sequelize(
    process.env.DB_NAME || 'beholder',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD,
    {
        dialect: process.env.DB_DIALECT || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || '5432',
        logging: process.env.DB_LOGS === 'true',
    }
)

module.exports = sequelize
