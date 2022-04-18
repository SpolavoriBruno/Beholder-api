const settingsModel = require('../models/settingsModel')
const { hashPassword, encrypt, decrypt } = require('../utils/crypto')

const settingsCache = []

exports.getSettingsByEmail = email => settingsModel.findOne({ where: { email } })

exports.getSettings = id => settingsModel.findOne({ where: { id } })

exports.updateSettings = async (id, newSettings) => {
    const currentSettings = await this.getSettings(id)

    if (newSettings.email !== currentSettings.email)
        currentSettings.email = newSettings.email

    if (newSettings.password)
        currentSettings.password = hashPassword(newSettings.password)

    if (newSettings.apiUrl !== currentSettings.apiUrl)
        currentSettings.apiUrl = newSettings.apiUrl

    if (newSettings.streamUrl !== currentSettings.streamUrl)
        currentSettings.streamUrl = newSettings.streamUrl

    if (newSettings.accessKey !== currentSettings.accessKey)
        currentSettings.accessKey = newSettings.accessKey

    if (newSettings.secretKey)
        currentSettings.secretKey = encrypt(newSettings.secretKey)

    await currentSettings.save()
}

exports.getDefaultSettings = () => settingsModel.findOne()

exports.getDecryptedSettings = async (id) => {
    let settings = settingsCache[id]

    if (!settings) {
        settings = await this.getSettings(id)
        settings.secretKey = decrypt(settings.secretKey)
        settingsCache[id] = settings
    }

    return settings
}

exports.clearSettingsCache = (id) => {
    settingsCache[id] = null
}
