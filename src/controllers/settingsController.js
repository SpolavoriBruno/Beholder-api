const { getSettings, updateSettings } = require('../repositories/settingsRepository')

exports.getSettings = (req, res, next) => {
    const id = res.locals.token.id

    getSettings(id)
        .then(settings => res.json(settings))
        .catch(error => {
            console.err(error)
            res.sendStatus(500)
        })
}

exports.updateSettings = async (req, res, next) => {
    const id = res.locals.token.id
    const newSettings = req.body

    await updateSettings(id, newSettings)

    res.sendStatus(200)
}
