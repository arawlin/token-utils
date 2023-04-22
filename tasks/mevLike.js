const { types } = require('hardhat/config')
const { sleep } = require('../libs')
const emailSend = require('../libs/emailSend')

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
        console.log(last, cur)

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
            value: t.value,
            gasPrice: t.gasPrice,
            valueWrap: ethers.utils.formatEther(t.value),
            gasPriceWrap: ethers.utils.formatUnits(t.gasPrice, 'gwei'),
            gasUsed: tr.gasUsed,
            gasFee: ethers.utils.formatEther(t.gasPrice.mul(tr.gasUsed)),
            data: t.data,
          }
          txs.push(tw)
          console.log(tw)
        }

        // already finished
        last++
      } catch (e) {
        console.error(e)
      }
    } while (false)

    let notifies = ''
    for (const t of txs) {
      if ((t.data.indexOf('0x3593564c') || t.data.indexOf('0x7ff36ab5')) && t.value.gt(ethers.BigNumber.from(0))) {
        // buy
        notifies += `buy - ${Number(ethers.utils.formatEther(t.value)).toFixed(4)}eth ${t.hashTransaction} || `
      } else if ((t.data.indexOf('0x3593564c') || t.data.indexOf('0x791ac947')) && t.value.eq(ethers.BigNumber.from(0))) {
        // sell
        notifies += `sell - ${t.hashTransaction} || `
      }
    }
    if (notifies) {
      await emailSend.send('mev', notifies)
    }

    await sleep(1 * 1000)
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
