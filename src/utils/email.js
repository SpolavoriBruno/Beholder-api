module.exports = (settings, message) => {
    if (!settings) throw new Error('Settings are required to send emails')
    if (!settings.sendGridKey) throw new Error('SendGrid Settings are required to send emails')

    const sgMail = require('@sendgrid/mail')
    sgMail.setApiKey(settings.sendGridKey)

    const msg = {
        to: settings.email,
        from: 'contact@terrana.fun',
        subject: `[Arcadia Beholder] - ${message.title}`,
        text: message.text,
    }

    return sgMail.send(msg).then(() => {
        console.count('Email sent')
    }).catch(error => logger.error(error))
}
