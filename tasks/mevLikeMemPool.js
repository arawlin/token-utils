const { sleep, timeOver, timeThen } = require('../libs')
const dbTransaction = require('../db/dbTransaction')

const TIMEOUT = 12 * 1000
const TIME_LOOP = 0.5 * 1000

const action = async ({ mev }, { ethers, web3 }) => {
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
    txpool.push({ ptx, time: new Date().getTime() })
    console.log('1', ptx)
  })

  while (true) {
    const txpoolrest = []
    while (txpool.length > 0) {
      try {
        const o = txpool.shift()
        // console.log('2', o)

        const t = await ethers.provider.getTransaction(o.ptx)
        if (!t) {
          if (!timeOver(o.time, TIMEOUT)) {
            txpoolrest.push(o)
          }
          continue
        }
        // console.log('3', t)

        if (t.confirmations > 0) {
          continue
        }

        if (t.from.toLowerCase() !== mev.toLowerCase()) {
          continue
        }
        console.log('4', t)

        const tw = {
          hashTransaction: t.hash,
          from: t.from,
          to: t.to,
          value: t.value.toString(),
          valueWrap: ethers.utils.formatEther(t.value),
          gasPrice: t.gasPrice.toString(),
          gasPriceWrap: ethers.utils.formatUnits(t.gasPrice, 'gwei'),
          gasLimit: t.gasLimit.toString(),
          data: t.data,
          timestamp: new Date().getTime() / 1000, // use current time
          timestampWrap: timeThen(new Date().getTime()),
        }
        await dbTransaction.save(mev, tw)
      } catch (e) {
        console.error(e)
      }
    }
    txpool.push(...txpoolrest)

    await sleep(TIME_LOOP)
  }
}

module.exports = {
  name: 'mevLikeMemPool',
  description: 'mev like others',
  params: [{ name: 'mev', description: 'address of mev', defaultValue: '' }],
  action,
}
