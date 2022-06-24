const { sleep } = require('../libs')
const dbTransaction = require('../db/dbTransaction')

const action = async ({ t, b, s, p }, { web3 }) => {
  let pp
  if (p) {
    pp = p.split(';')
    pp = pp.map((i) => i.split(','))
  }
  const topics = pp ? [s, ...pp] : [s]
  const options = {
    fromBlock: b ?? null,
    address: t,
    topics,
  }
  web3.eth.subscribe('logs', options, async (error, log) => {
    if (error) {
      console.error(error)
      return
    }

    try {
      console.log(`subscribe logs - ${log.transactionHash}`)
      await dbTransaction.update({ transactionHash: log.transactionHash }, log)
    } catch (e) {
      console.error(e)
    }
  })

  while (true) {
    await sleep(10 * 1000)
    console.log('......')
  }
}

module.exports = {
  name: 'eventToken',
  describtion: 'a listener of event of token',
  params: [
    { name: 't', describtion: 'address of token' },
    { name: 'b', describtion: 'from block number, from now if not set' },
    { name: 's', describtion: 'topics[0]: the hash of signature of method' },
    { name: 'p', describtion: '";" split the params of method, "," split the option for each topic. e.g. aaa,bbb;ccc', defaultValue: '' },
  ],
  action,
}
