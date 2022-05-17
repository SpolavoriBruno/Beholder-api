module.exports = (settings, message) => {
    if (!settings) throw new Error('Settings are required to send SMS')
    if (!settings.twilioSid || !settings.twilioToken || !settings.twilioPhone) throw new Error('SendGrid Settings are required to send emails')
    if (!settings.phone) return

    const client = require('twilio')(settings.twilioSid, settings.twilioToken)

    return client.messages.create({
        to: settings.phone,
        from: settings.twilioPhone,
        body: `[Arcadia Beholder] - ${message.text}`
    })
}
