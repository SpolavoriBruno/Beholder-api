const jwt = require('jsonwebtoken')

const { checkPassword } = require('../utils/crypto')
const { getSettingsByEmail } = require('../repositories/settingsRepository')

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_DEFAULT = process.env.JWT_EXPIRES_DEFAULT
const JWT_EXPIRES_REMEMBER = process.env.JWT_EXPIRES_REMEMBER

const MINUTES_IN_HOUR = 60
const HOURS_IN_DAY = 24

exports.doLogin = async (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    const daysToExpire = req.body.remember ? JWT_EXPIRES_DEFAULT : JWT_EXPIRES_REMEMBER

    const settings = await getSettingsByEmail(email)

    if (settings) {
        const isValid = checkPassword(password, settings.password)

        if (isValid) {
            const token = jwt.sign({ id: settings.id }, JWT_SECRET, {
                expiresIn: MINUTES_IN_HOUR * HOURS_IN_DAY * daysToExpire
            })
            return res.json({ token })
        }
    }

    return res.sendStatus(401)
}

const blacklist = []

exports.doLogout = (req, res, next) => {
    const token = req.headers['authorization']
    blacklist.push(token)
    res.sendStatus(200)
}

exports.isBlacklisted = token => blacklist.some(t => t === token)
