const { createLogger, transports, format } = require('winston')
const { combine, timestamp, label, printf } = format

const customFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`
})

function dateFormater () {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1
  const day = today.getDate()
  return `LOG_${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
}

const logger = () => {
  const dateStr = dateFormater()
  const filenameWithDate = 'logs/' + dateStr + '.log'
  return   createLogger({
    level: 'debug',
    format: combine(label({ label: 'loging' }), timestamp(), customFormat),
    // logger method...
    transports: [
      // new transports:
      new transports.File({
        // filename: `logs/${fileName()}.log`
        filename: filenameWithDate
      }),
      new transports.Console({
        level: 'info',
        format: format.combine(
          format.colorize(),
          format.simple()
        )
      })
    ]
    // ...
  })
}



module.exports = logger
