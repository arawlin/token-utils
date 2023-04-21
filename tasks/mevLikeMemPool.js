const { sleep } = require('../libs')

const TIMEOUT = 12

const action = async ({ mev, router }, { ethers, web3 }) => {
  if (!mev) {
    console.log('address not config')
    return
  }
  console.log('ethers', await ethers.provider.getNetwork())
  console.log('web3', web3.currentProvider.url)

  const txpool = []
  web3.eth.subscribe('pendingTransactions', async (error, ptx) => {
    if (error) {
      console.error(error)
      return
    }
    txpool.push({ ptx, delay: 0 })
    console.log('1', ptx)
  })

  while (true) {
    const txpoolrest = []
    while (txpool.length > 0) {
      try {
        const o = txpool.shift()
        console.log('2', o)

        const t = await ethers.provider.getTransaction(o.ptx)
        if (!t) {
          if (++o.delay <= TIMEOUT) {
            txpoolrest.push(o)
          }
          continue
        }
        console.log('3', t)

        if (t.from.toLowerCase() !== mev.toLowerCase()) {
          continue
        }
        console.log('4', t)
      } catch (e) {
        console.error(e)
      }
    }
    txpool.push(...txpoolrest)

    await sleep(1 * 1000)
  }
}

module.exports = {
  name: 'mevLikeMemPool',
  description: 'mev like others',
  params: [
    { name: 'mev', description: 'address of mev', defaultValue: '' },
    { name: 'router', description: 'address of router', defaultValue: '' },
  ],
  action,
}
