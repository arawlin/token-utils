const { sleep } = require('../libs')
const emailSend = require('../libs/emailSend')

const action = async ({ a }, { web3 }) => {
  web3.eth.subscribe('newBlockHeaders', async (error, { number }) => {
    if (error) {
      console.error(error)
      return
    }
    console.log(number)

    try {
      const block = await web3.eth.getBlock(number, true)
      const txs = block?.transactions
      if (!txs) {
        return
      }
      txs.forEach((t) => {
        if (t.from.toLowerCase() !== a.toLowerCase()) {
          return
        }

        const msg = `block num: ${number}, from: ${t.from}, txid: ${t.blockHash}`
        console.log(msg)

        emailSend.send('address event', msg)
      })
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
  name: 'eventAddress',
  description: 'a listener of event of address',
  params: [{ name: 'a', description: 'address to listen' }],
  action,
}
