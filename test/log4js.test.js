const path = require('path')
const log4js = require('log4js')

describe('log4js', () => {
  it('filename', () => {
    const f1 = __filename.slice(__dirname.length + 1)
    const f2 = __filename.split('.')[0].slice(__dirname.length + 1)
    console.log(f1, f2)
  })
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
