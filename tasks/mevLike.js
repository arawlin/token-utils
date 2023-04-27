const { types } = require('hardhat/config')
const { sleep, timeThen } = require('../libs')
const dbTransaction = require('../db/dbTransaction')

const TIME_LOOP = 0.5 * 1000

const action = async ({ a, b }, { ethers }) => {
  if (!a) {
    console.log('address not config')
    return
  }

  let last = b || (await ethers.provider.getBlockNumber())
  while (true) {
    const txs = []

    do {
      try {
        const cur = await ethers.provider.getBlockNumber()
        if (cur === last) {
          break
        }
        last++
        console.log(last, cur)

        const block = await ethers.provider.getBlock(last)
        const bt = await ethers.provider.getBlockWithTransactions(last)
        if (!bt) {
          break
        }

        for (const t of bt.transactions) {
          if (t.from.toLowerCase() !== a.toLowerCase()) {
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
            to: t.to,
            value: t.value.toString(),
            valueWrap: ethers.utils.formatEther(t.value),
            gasPrice: t.gasPrice.toString(),
            gasPriceWrap: ethers.utils.formatUnits(t.gasPrice, 'gwei'),
            gasUsed: tr.gasUsed.toString(),
            gasFee: ethers.utils.formatEther(t.gasPrice.mul(tr.gasUsed)),
            data: t.data,
            timestamp: block.timestamp,
            timestampWrap: timeThen(block.timestamp * 1000),
          }
          txs.push(tw)
          console.log(tw)
        }
      } catch (e) {
        console.error(e)
      }
    } while (false)

    if (txs.length > 0) {
      await dbTransaction.saveAll(a, txs)
    }

    await sleep(TIME_LOOP)
  }
}

module.exports = {
  name: 'mevLike',
  description: 'mev like others',
  params: [
    { name: 'a', description: 'address of mev', defaultValue: '' },
    { name: 'b', description: 'last block number', defaultValue: 0, valueType: types.int },
  ],
  action,
}
