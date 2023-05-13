const path = require('path')
const log4js = require('log4js')

describe('log4js', () => {
  it('1', () => {
    const logger = log4js.getLogger('test1')
    logger.level = 'debug'
    console.log('aaa')
    logger.debug('Time:', new Date())
    console.log('aaa')
  })

  it('2', () => {
    log4js.configure('test/log4js.json')
    const logger = log4js.getLogger('test2')
    logger.level = 'debug'
    logger.warn('Time:', new Date())
  })
})
