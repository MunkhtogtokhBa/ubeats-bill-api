const express = require('express')
require('dotenv').config()
const cors = require('cors')
const printBill = require('./src/controllers/print-bill')
const { secure, decodTest, encodTest } = require('./src/midleware/security')
const errorHandler = require('./src/midleware/errorHandler')
const logger = require('./src/util/logger')
const app = express()
const port = 3000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use((req, res, next) => {
  // console.log(req)
  logger.log({
    level: 'info',
    message: req.originalUrl
  })
  next()
})
app.use('/ubeats', secure, printBill)
app.use('/test/decode', decodTest)
app.use('/test/encode', encodTest)
app.get('/ping', (req, res) => {
  res.send('pong')
})

app.use((req, res) => {
  const response = {
    code: 404,
    message: 'Route not found!'
  }
  res.status(200).send(response)
})
app.use(errorHandler)
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
