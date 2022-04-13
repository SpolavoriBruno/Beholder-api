const { getSettings } = require('../repositories/settingsRepository')

exports.getSettings = (req, res, next) => {
    const id = res.locals.token.id
    console.log(id)
    getSettings(id)
        .then(settings => res.json(settings))
        .catch(error => res.json(error).status(500))
}
