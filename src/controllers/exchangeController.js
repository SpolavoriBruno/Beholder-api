const { getDecryptedSettings } = require('../repositories/settingsRepository')

exports.getBalance = async (req, res) => {
    const id = res.locals.token.id
    const settings = await getDecryptedSettings(id)

    const { balance } = require('../utils/exchange')(settings)

    balance()
        .then(data => res.json(data))
        .catch(err => res.status(500).json(err))
}
