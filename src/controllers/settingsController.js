const { getSettings, updateSettings } = require('../repositories/settingsRepository')
const errorHandler = require('../utils/errorHandler')

exports.getSettings = (req, res, next) => {
    const id = res.locals.token.id

    getSettings(id)
        .then(settings => res.json(settings))
        .catch(e => errorHandler(e, (s, b) => res.status(s).json(b)))
}

exports.updateSettings = async (req, res, next) => {
    const id = res.locals.token.id
    const newSettings = req.body

    await updateSettings(id, newSettings)
        .catch(e => errorHandler(e, (s, b) => res.status(s).json(b)))

    res.sendStatus(200)
}
