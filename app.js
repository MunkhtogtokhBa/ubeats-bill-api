const express = require('express')
require('dotenv').config()
const printBill = require('./src/controllers/print-bill')
const { secure } = require('./src/midleware/security')
const errorHandler = require('./src/midleware/errorHandler')
const app = express()
const port = 3000

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/ubeats', secure, printBill)
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
