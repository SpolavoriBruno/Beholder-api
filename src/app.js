const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')

const authMiddleware = require('./middlewares/authMiddleware')
const { doLogin, doLogout } = require('./controllers/authController')
const settingsRouter = require('./routers/settingsRouter')

require('express-async-errors')

const app = express()

app.use(cors({ origin: process.env.CORS_ORIGIN }))
app.use(helmet())
app.use(express.json())
app.use(morgan('dev'))

app.post('/login', doLogin)

app.post('/logout', authMiddleware, doLogout)
app.use('/settings', authMiddleware, settingsRouter)

app.use('/error', (req, res, next) => { throw new Error('Rota de erro') })
app.use('/', (req, res, next) => { res.send('Hello World') })

app.use(require('./middlewares/errorMiddleware'))

module.exports = app
