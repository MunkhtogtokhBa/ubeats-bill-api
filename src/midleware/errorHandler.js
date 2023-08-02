const logger = require('../util/logger')

function handleError (err, req, res, next) {
  logger.log('error', err.stack)

  const resp = {
    date: new Date().toISOString(),
    error: err
  }

  return res.status(err.statusCode || 500).json(resp)
}

module.exports = handleError
