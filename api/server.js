const express = require('express')
const helmet = require('helmet')
const cors = require('cors')

const server = express()

const authRouter = require('./auth/auth-router')

server.use(express.json())
server.use(helmet())
server.use(cors())

server.get('/', (req, res) => {
  res.send("<h1>Welcome to Water My Plants API</h1>")
})

server.use('/auth', authRouter)

server.use((err, req, res, next) => {//eslint-disable-line
  res.status(err.status || 500).json({ message: err.message })
})

module.exports = server
