const logger = require('./logger')

const ERROR_TYPES = {
    UNKNOWN: 'UNKNOWN',
    NOT_FOUND: 'NOT_FOUND',
    FORBIDDEN: 'FORBIDDEN',
    UNAUTHORIZED: 'UNAUTHORIZED',
}

const findErrorType = (error) => {
    if (error.statusCode)
        switch (+error.statusCode) {
            case 401:
                return ERROR_TYPES.UNAUTHORIZED
        }

    if (error.name)
        switch (error.name) {
            case value:

                break;
        }
}

module.exports = (error, callback) => {
    let status = 501
    let body = undefined

    switch (findErrorType(error)) {
        case ERROR_TYPES.UNAUTHORIZED:
            status = 401
            break;

        default:
            status = 500
            body = error
            logger.error(error)
    }

    if (callback) return callback(status, body)
}
