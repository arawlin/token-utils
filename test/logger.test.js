const { sleep } = require('../libs')
const logger = require('../libs/logger')

describe('logger', () => {
  before(() => {
    logger.init('test')
  })

  it('1', () => {
    const l = logger.getLogger('111')
    l.debug('this is a debug')
    l.info('this is a info')
    l.error('this is a error')
  })

  it('long time', async () => {
    //       file: { type: 'dateFile', filename: name + '.log', layout, numBackups: 7, compress: false, pattern: 'yyyy-MM-dd-hh-mm' },
    const l = logger.getLogger('222')
    for (let i = 0; i <= 500; ++i) {
      l.debug('this is a debug', i)

      if (i % 10 === 0) {
        l.error('this is a error', i)
      }
      await sleep(1000)
    }
    await logger.shutdown()
  })
})
