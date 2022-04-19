const logger = require('../utils/logger')

module.exports = (err, req, res) => {
    logger.error(err)
}
