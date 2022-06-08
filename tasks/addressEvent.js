const { sleep } = require('../libs')
const emailUtils = require('../libs/emailUtils')

const action = async ({ a }, { ethers }) => {
  const p = new ethers.providers.WebSocketProvider(process.env.URL_RPC_WS)
  p.on('block', async (blockNumber) => {
    try {
      console.log(blockNumber)

      const block = await p.getBlockWithTransactions(blockNumber)
      const txs = block?.transactions
      if (!txs) {
        return
      }
      txs.forEach((t) => {
        if (t.from.toLowerCase() !== a.toLowerCase()) {
          return
        }

        const msg = `block num: ${blockNumber}, from: ${t.from}, txid: ${t.hash}`
        console.log(msg)

        emailUtils.send('address event', msg)
      })
    } catch (e) {
      console.error(e)
    }
  })
  p.on('error', console.log)

  while (true) {
    await sleep(10 * 1000)
    console.log('......')
  }
}

module.exports = {
  name: 'addressEvent',
  describtion: 'a listener of event of address',
  params: [{ name: 'a', describtion: 'address to listen' }],
  action,
}
