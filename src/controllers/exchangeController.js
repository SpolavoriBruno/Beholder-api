const { getDecryptedSettings } = require('../repositories/settingsRepository')
const errorHandler = require('../utils/errorHandler')

exports.getBalance = async (req, res) => {
    const id = res.locals.token.id
    const settings = await getDecryptedSettings(id)

    const { balance } = require('../utils/exchange')(settings)

    balance()
        .then(data => res.json(data))
        .catch(e => errorHandler(e, (s, b) => res.status(s).json(b)))
}
