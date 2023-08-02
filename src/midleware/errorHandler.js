const logger = require('../util/logger')

function handleError (err, req, res, next) {
//   logger.log('error', err.status)
//   logger.log('error', err.message)
//   logger.log('error', err.errors)
//   logger.log('error', err.stack)
  logger.log('error', err)

  const resp = {
    date: new Date().toISOString(),
    error: err
  }

  return res.status(err.statusCode || 500).json(resp)
}

module.exports = handleError
