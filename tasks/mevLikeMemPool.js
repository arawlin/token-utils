const NAME_FILE = __filename.split('.')[0].slice(__dirname.length + 1)
const logger = require('../libs/logger').getLogger()

const { sleep, timeOver, timeThen } = require('../libs')
const dbTransaction = require('../db/dbTransaction')

const TIMEOUT = 12 * 1000
const TIME_LOOP = 0.5 * 1000

const action = async ({ mev }, { ethers, web3 }) => {
  if (!mev) {
    logger.warn('address not config')
    return
  }
  logger.info('ethers', await ethers.provider.getNetwork())
  logger.info('web3', web3.currentProvider.url)

  const txpool = []
  web3.eth.subscribe('pendingTransactions', async (error, ptx) => {
    if (error) {
      logger.error(error)
      return
    }
    txpool.push({ ptx, time: new Date().getTime() })
    logger.debug('1', ptx)
  })

  while (true) {
    const txpoolrest = []
    while (txpool.length > 0) {
      try {
        const o = txpool.shift()
        logger.debug('2', o)

        const t = await ethers.provider.getTransaction(o.ptx)
        if (!t) {
          if (!timeOver(o.time, TIMEOUT)) {
            txpoolrest.push(o)
          }
          continue
        }
        logger.debug('3', t)

        if (t.confirmations > 0) {
          continue
        }
        if (t.from.toLowerCase() !== mev.toLowerCase()) {
          continue
        }
        logger.info('4', t)

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
        logger.error(e)
      }
    }
    txpool.push(...txpoolrest)

    await sleep(TIME_LOOP)
  }
}

module.exports = {
  name: NAME_FILE,
  description: 'mev like others',
  params: [{ name: 'mev', description: 'address of mev', defaultValue: '' }],
  action,
}
