const log4js = require('log4js')

// require('dotenv').config()
const LEVEL_LOGGER = process.env.LEVEL_LOGGER
console.log('LEVEL_LOGGER', LEVEL_LOGGER)

const init = (name) => {
  const layout = {
    type: 'pattern',
    pattern: '%d{yyyy-MM-dd hh:mm:ss.SSS} %c %f{1}:%l %p %m',
  }
  log4js.configure({
    appenders: {
      console: { type: 'stdout', layout },
      file: { type: 'dateFile', filename: name + '.log', layout, numBackups: 7, compress: false },
      fileError: { type: 'dateFile', filename: name + '.error.log', layout, pattern: 'yyyy-MM' },
      filterError: {
        type: 'logLevelFilter',
        appender: 'fileError',
        level: 'error',
      },
    },
    categories: {
      default: { appenders: ['filterError', 'file', 'console'], level: LEVEL_LOGGER, enableCallStack: true },
    },
  })
}

const shutdown = async () => {
  return new Promise((resolve, reject) => {
    log4js.shutdown((error) => {
      error ? reject(error) : resolve()
    })
  })
}

const getLogger = (category = '') => {
  return log4js.getLogger(category)
}

module.exports = {
  init,
  shutdown,
  getLogger,
}
