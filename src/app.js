const express = require('express')
const cors = require('cors')
const helmet = require('helmet')

const authMiddleware = require('./middlewares/authMiddleware')
const {doLogin, doLogout} = require('./controllers/authController')
const {getSettings} = require('./controllers/settingsController')

require('express-async-errors')

const app = express()

app.use(cors())
app.use(helmet())
app.use(express.json())

app.post('/login', doLogin)

app.post('/logout', authMiddleware, doLogout)

app.get('/settings', authMiddleware, getSettings)

app.use('/error', (req, res, next) => { throw new Error('Rota de erro') })
app.use('/', (req, res, next) => { res.send('Hello World') })

app.use(require('./middlewares/errorMiddleware'))

module.exports = app
