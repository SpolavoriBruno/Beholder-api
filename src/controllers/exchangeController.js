const { getDecryptedSettings } = require('../repositories/settingsRepository')
const errorHandler = require('../utils/errorHandler')
const { tryUSDConvertion } = require('../beholder')

exports.getBalance = async (req, res) => {
    const id = res.locals.token.id
    const settings = await getDecryptedSettings(id)

    const { balance } = require('../utils/exchange')(settings)

    balance()
        .then(data => {
            const usd = Object.entries(data).map(prop => {
                let available = prop[1].available
                if (available > 0) available = tryUSDConvertion(prop[0], available)

                let onOrder = prop[1].onOrder
                if (onOrder > 0) onOrder = tryUSDConvertion(prop[0], onOrder)

                return available + onOrder
            }).reduce((acc, curr) => parseFloat(acc) + parseFloat(curr))

            data.estimatedUSD = { available: usd.toFixed(2), onOrder: '0' }
            res.json(data)
        })
        .catch(e => errorHandler(e, (s, b) => res.status(s).json(b)))
}
