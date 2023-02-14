const settingsModel = require('../models/settingsModel')
const { hashPassword, encrypt, decrypt } = require('../utils/crypto')

const settingsCache = []

exports.getSettingsByEmail = email => settingsModel.findOne({ where: { email } })

exports.getSettings = id => settingsModel.findOne({ where: { id } })

exports.updateSettings = async (id, newSettings) => {
    const currentSettings = await this.getSettings(id)
    let needReboot = false
    this.clearSettingsCache(id)

    if ((!currentSettings.accessKey && newSettings.accessKey)
        || (!currentSettings.secretKey) && newSettings.secretKey) needReboot = true

    if (newSettings.email && newSettings.email !== currentSettings.email)
        currentSettings.email = newSettings.email

    if (newSettings.password)
        currentSettings.password = hashPassword(newSettings.password)

    if (newSettings.phone && newSettings.phone !== currentSettings.phone)
        currentSettings.phone = newSettings.phone

    if (newSettings.apiUrl && newSettings.apiUrl !== currentSettings.apiUrl)
        currentSettings.apiUrl = newSettings.apiUrl

    if (newSettings.streamUrl && newSettings.streamUrl !== currentSettings.streamUrl)
        currentSettings.streamUrl = newSettings.streamUrl

    if (newSettings.accessKey && newSettings.accessKey !== currentSettings.accessKey)
        currentSettings.accessKey = newSettings.accessKey

    if (newSettings.twilioSid && newSettings.twilioSid !== currentSettings.twilioSid)
        currentSettings.twilioSid = newSettings.twilioSid

    if (newSettings.twilioPhone && newSettings.twilioPhone !== currentSettings.twilioPhone)
        currentSettings.twilioPhone = newSettings.twilioPhone

    if (newSettings.secretKey)
        currentSettings.secretKey = encrypt(newSettings.secretKey)

    if (newSettings.sendGridKey)
        currentSettings.sendGridKey = encrypt(newSettings.sendGridKey)

    if (newSettings.twilioToken)
        currentSettings.twilioToken = encrypt(newSettings.twilioToken)

    await currentSettings.save()

    // Considerando que rodará no Docker, encerrar o processo com erro irá reinicia-lo
    if (needReboot) setTimeout(() => process.exit(1), 2000)
    // TODO: Criar metodo que realmente reinicia o bot, recarregando as configurações
}

exports.getDefaultSettings = () => this.getDecryptedSettings(process.env.DEFAULT_SETTINGS_ID)

exports.getDecryptedSettings = async (id) => {
    let settings = settingsCache[id]

    if (!settings) {
        settings = await this.getSettings(id)
        settings.secretKey && (settings.secretKey = decrypt(settings.secretKey))
        settings.sendGridKey && (settings.sendGridKey = decrypt(settings.sendGridKey))
        settings.twilioToken && (settings.twilioToken = decrypt(settings.twilioToken))

        settingsCache[id] = settings
    }

    return settings
}

exports.clearSettingsCache = (id) => {
    settingsCache[id] = null
}
