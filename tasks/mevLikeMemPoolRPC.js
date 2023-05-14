const NAME_FILE = __filename.split('.')[0].slice(__dirname.length + 1)
const logger = require('../libs/logger').init(NAME_FILE)

const { sleep, timeOver, timeNow, timeThen } = require('../libs')
const dbTransaction = require('../db/dbTransaction')

const TIME_LOOP = 0.5 * 1000
const TIMEOUT = 5 * 60 * 1000

const action = async ({ mev }, { ethers, web3 }) => {
  if (!mev) {
    logger.warn('address not config')
    return
  }
  logger.info('ethers', await ethers.provider.getNetwork())
  logger.info('web3', web3.currentProvider.url)

  let timeAccum = 0
  const txsaveds = new Map()
  while (true) {
    const res = await web3.eth.txpool.contentFrom(mev)
    res.all = { ...res.pending, ...res.queued }

    const txs = Object.values(res.all)
    for (let i = 0; i < txs.length; ++i) {
      const t = txs[i]
      if (txsaveds.has(t.hash)) {
        continue
      }
      logger.info(t)

      try {
        const tw = {
          hashTransaction: t.hash,
          from: t.from,
          to: t.to,
          value: ethers.BigNumber.from(t.value).toString(),
          valueWrap: ethers.utils.formatEther(t.value),
          gasPrice: ethers.BigNumber.from(t.gasPrice).toString(),
          gasPriceWrap: ethers.utils.formatUnits(t.gasPrice, 'gwei'),
          gasLimit: ethers.BigNumber.from(t.gas).toString(),
          data: t.input,
          timestamp: new Date().getTime() / 1000, // use current time
          timestampWrap: timeThen(new Date().getTime()),
        }
        await dbTransaction.save(mev, tw)

        txsaveds.set(t.hash, new Date().getTime())
      } catch (e) {
        logger.error(e)
      }
    }

    await sleep(TIME_LOOP)

    timeAccum += TIME_LOOP
    if (timeAccum < TIMEOUT) {
      continue
    }
    timeAccum = 0

    const ki = txsaveds.keys()
    for (const k of ki) {
      if (timeOver(txsaveds.get(k), TIMEOUT)) {
        txsaveds.delete(k)
      }
    }
  }
}

module.exports = {
  name: NAME_FILE,
  description: 'mev like by geth rpc directly',
  params: [{ name: 'mev', description: 'address of mev', defaultValue: '' }],
  action,
}
