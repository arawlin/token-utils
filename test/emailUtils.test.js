const utils = require('../libs/emailUtils')

describe('email utils', () => {
  it('send', async () => {
    await utils.send('test', 'askdjkf sss')
  })
})
