const settingsModel = require('../models/settingsModel')
const { hashPassword, encrypt } = require('../utils/crypto')

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

    if (newSettings.accessKey !== currentSettings.accessKey)
        currentSettings.accessKey = newSettings.accessKey

    if (newSettings.secretKey)
        currentSettings.secretKey = encrypt(newSettings.secretKey)

    await currentSettings.save()
}
