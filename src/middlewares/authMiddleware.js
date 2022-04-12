const jwt = require('jsonwebtoken')
const { isBlacklisted } = require('../controllers/authController')

const JWT_SECRET = process.env.JWT_SECRET

module.exports = (req, res, next) => {
    const token = req.headers['authorization']

    if (token && ! isBlacklisted(token)) {
        try {
            const decode = jwt.verify(token, JWT_SECRET)
            if (decode) {
                res.locals.token = decode
                return next()
            }
        } catch (error) {
            console.error(error)
        }
    }
    res.sendStatus(401)

}
