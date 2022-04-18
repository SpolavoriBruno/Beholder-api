const Websockets = require('ws')
const jwt = require('jsonwebtoken')
const { isBlacklisted } = require('./controllers/authController')

function onMessage(data) {
    console.log(data);
}

function onError(error) {
    console.error(error)
}

function onConnection(ws, req) {
    ws.on('message', onMessage)
    ws.on('error', onError)
    console.info('New Client Connected')
}

function corsValidation(origin) {
    return process.env.CORS_ORIGIN.startsWith(origin)
}

function verifyClient(info, callback) {
    if (!corsValidation(info.origin)) return callback(false, 401)
    const token = info.req.url.split('token=')[1]
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            if (decoded && !isBlacklisted(token))
                return callback(true)
        } catch (error) {
            console.error(error)
        }
    }
    return callback(false, 401)
}

module.exports = server => {
    const wss = new Websockets.Server({
        server,
        verifyClient: verifyClient
    })
    console.info('WebSocket Server is running')

    wss.on('connection', onConnection)

    return wss
}
