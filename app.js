const express = require('express')
const printBill = require('./src/controllers/print-bill')
const app = express()
const port = 3000

app.get('/ping', (req, res) => {
  res.send('pong')
})

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/ubeats', printBill)

// app.use((req, res) => {
//   const response = {
//     code: 404,
//     message: 'Route not found!',
//   };
//   res.status(200).send(response);
// })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
