const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const router = require('./routers/router')

require('express-async-errors')

const app = express()

app.use(cors({ origin: process.env.CORS_ORIGIN }))
app.use(helmet())
app.use(express.json())
app.use(morgan('dev'))

app.use(router)

app.use('/error', (req, res) => { throw new Error('Rota de erro') })
app.use('/', (req, res) => { res.send('Hello World') })
app.use(require('./middlewares/errorMiddleware'))

module.exports = app
