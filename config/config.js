require('dotenv').config()

const {
    DB_DIALECT, DB_HOST,
    DB_NAME, DB_PASSWORD,
    DB_PORT, DB_USER
} = process.env

module.exports = {
    development: {
        username: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        host: DB_HOST,
        port: DB_PORT,
        dialect: DB_DIALECT,
        loggin: true
    },
    test: {
        username: DB_USER,
        password: DB_PASSWORD,
        database: `${DB_NAME}-test`,
        host: DB_HOST,
        port: DB_PORT,
        dialect: DB_DIALECT,
        loggin: true
    },
    production: {
        username: DB_USER,
        password: DB_PASSWORD,
        database: `${DB_NAME}-prod`,
        host: DB_HOST,
        port: DB_PORT,
        dialect: DB_DIALECT,
        loggin: true
    }
}
