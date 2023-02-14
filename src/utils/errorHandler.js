const logger = require('./logger')

const ERROR_TYPES = {
    UNKNOWN: 'UNKNOWN',
    NOT_FOUND: 'NOT_FOUND',
    FORBIDDEN: 'FORBIDDEN',
    UNAUTHORIZED: 'UNAUTHORIZED',
    DB_ERROR: 'DB_ERROR',
}

const findErrorType = (error) => {
    if (error.statusCode)
        switch (+error.statusCode) {
            case 401:
                return ERROR_TYPES.UNAUTHORIZED
        }
    if (error.message && error.name) {
        if (error.message.includes('WHERE')) {
            return ERROR_TYPES.DB_ERROR
        }
    }
}

module.exports = (error, callback, options) => {
    let status = 501
    let body = undefined

    options?.on && logger.error(`on ${options.on}`, error)

    switch (findErrorType(error)) {
        case ERROR_TYPES.UNAUTHORIZED:
            status = 401
            break

        case ERROR_TYPES.DB_ERROR:
            status = 400
            body = {
                error: error.message || serverErrorMsg,
            }
            break

        default:
            status = 500
            body = error
            logger.error(error)
    }
    console.log(status, body)
    if (callback) return callback(status, body)
}
