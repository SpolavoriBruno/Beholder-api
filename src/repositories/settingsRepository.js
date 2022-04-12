const settingsModel = require('../models/settingsModel')

exports.getSettingsByEmail = (email) => settingsModel.findOne({ where: { email } })
