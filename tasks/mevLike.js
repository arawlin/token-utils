const NAME_FILE = __filename.split('.')[0].slice(__dirname.length + 1)
const logger = require('../libs/logger').init(NAME_FILE)

const { types } = require('hardhat/config')
const { sleep, timeNow, timeThen, timeElapse } = require('../libs')
const dbTransaction = require('../db/dbTransaction')

const TIME_LOOP = 0.5 * 1000

const action = async ({ mev, block }, { ethers }) => {
  if (!mev) {
    logger.warn('address not config')
    return
  }

  let last = block || (await ethers.provider.getBlockNumber())
  while (true) {
    do {
      try {
        const timeStart = new Date().getTime()

        const cur = await ethers.provider.getBlockNumber()
        if (cur === last) {
          break
        }
        last++

        const block = await ethers.provider.getBlock(last)
        const bt = await ethers.provider.getBlockWithTransactions(last)
        if (!bt) {
          break
        }

        const txs = []
        for (const t of bt.transactions) {
          if (t.from.toLowerCase() !== mev.toLowerCase()) {
            continue
          }

          const tr = await ethers.provider.getTransactionReceipt(t.hash)
          if (tr.status !== 1) {
            continue
          }
          const tw = {
            hashTransaction: t.hash,
            blockNumber: t.blockNumber,
            status: tr.status,
            from: t.from,
            to: t.to,
            value: t.value.toString(),
            valueWrap: ethers.utils.formatEther(t.value),
            gasPrice: t.gasPrice.toString(),
            gasPriceWrap: ethers.utils.formatUnits(t.gasPrice, 'gwei'),
            gasUsed: tr.gasUsed.toString(),
            gasFee: ethers.utils.formatEther(t.gasPrice.mul(tr.gasUsed)),
            gasLimit: t.gasLimit.toString(),
            data: t.data,
            timestamp: block.timestamp,
            timestampWrap: timeThen(block.timestamp * 1000),
            timeUpdate: timeNow(),
          }
          txs.push(tw)
          logger.info(tw)
        }

        if (txs.length > 0) {
          await dbTransaction.saveAll(mev, txs)
        }

        logger.info(last, cur, `elapse - ${timeElapse(timeStart)}`)
      } catch (e) {
        logger.error(last, e)
      }
    } while (false)

    await sleep(TIME_LOOP)
  }
}

module.exports = {
  name: NAME_FILE,
  description: 'mev like others',
  params: [
    { name: 'mev', description: 'address of mev', defaultValue: '' },
    { name: 'block', description: 'last block number', defaultValue: 0, valueType: types.int },
  ],
  action,
}
