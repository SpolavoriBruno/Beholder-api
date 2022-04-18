const Websockets = require('ws')

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

module.exports = server => {
    const wss = new Websockets.Server({ server })
    console.info('WebSocket Server is running')

    wss.on('connection', onConnection)

    return wss
}
