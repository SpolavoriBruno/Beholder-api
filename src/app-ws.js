const Websockets = require('ws')
const jwt = require('jsonwebtoken')
const { isBlacklisted } = require('./controllers/authController')
const logger = require('./utils/logger')

function onMessage(data) {
    logger.log(data)
}

function onError(error) {
    logger.error(error)
}

function onConnection(ws, req) {
    ws.on('message', onMessage)
    ws.on('error', onError)
    logger.info('New Client Connected')
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
            logger.error(error)
        }
    }
    return callback(false, 401)
}

function broadcast(jsonObject) {
    if (!this.clients) return
    this.clients.forEach(client => {
        if (client.readyState === Websockets.OPEN) {
            client.send(JSON.stringify(jsonObject))
        }
    })
}


module.exports = server => {
    const wss = new Websockets.Server({
        server,
        verifyClient
    })
    logger.info('WebSocket Server is running')

    wss.on('connection', onConnection)
    wss.broadcast = broadcast
    return wss
}
