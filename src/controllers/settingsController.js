const { getSettings, updateSettings } = require('../repositories/settingsRepository')
const errorHandler = require('../utils/errorHandler')

const sanatizeSettings = settings => {
    settings = settings.get({ plain: true })
    delete settings.password
    delete settings.secretKey
    delete settings.sendGridKey
    delete settings.twilioToken
    return settings
}

exports.getSettings = (req, res, next) => {
    const id = res.locals.token.id

    getSettings(id)
        .then(settings => res.json(sanatizeSettings(settings)))
        .catch(e => errorHandler(e, (s, b) => res.status(s).json(b)))
}

exports.updateSettings = async (req, res, next) => {
    const id = res.locals.token.id
    const newSettings = req.body

    await updateSettings(id, newSettings)
        .then(_ => res.sendStatus(202))
        .catch(e => errorHandler(e, (s, b) => res.status(s).json(b)))
}
