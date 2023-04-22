const { sleep } = require('../libs')
const emailSend = require('../libs/emailSend')

const action = async ({ a, b }, { ethers }) => {
  if (!a) {
    console.log('address not config')
    return
  }

  let last = 0
  while (true) {
    let notifies = ''

    do {
      const cur = await ethers.provider.getBlockNumber()
      if (cur === last) {
        break
      }

      let lasting = 0
      if (b && b < cur) {
        lasting = b++
      } else {
        lasting = cur
        b = undefined
      }
      console.log(lasting, cur)

      try {
        const bt = await ethers.provider.getBlockWithTransactions(lasting)
        if (!bt) {
          break
        }

        for (const t of bt.transactions) {
          if (t.from.toLowerCase() !== a.toLowerCase()) {
            continue
          }

          const tr = await ethers.provider.getTransactionReceipt(t.hash)
          console.log({
            hashTransaction: t.hash,
            blockNumber: t.blockNumber,
            status: tr.status,
            to: t.to,
            value: ethers.utils.formatEther(t.value),
            gasPrice: ethers.utils.formatUnits(t.gasPrice, 'gwei'),
            gasUsed: tr.gasUsed,
            gasFee: ethers.utils.formatEther(t.gasPrice.mul(tr.gasUsed)),
            data: t.data,
          })
          if (tr.status !== 1) {
            continue
          }

          if ((t.data.indexOf('0x3593564c') || t.data.indexOf('0x7ff36ab5')) && t.value.gt(ethers.BigNumber.from(0))) {
            // buy
            notifies += `buy - ${Number(ethers.utils.formatEther(t.value)).toFixed(4)}eth ${t.hash} || `
          } else if ((t.data.indexOf('0x3593564c') || t.data.indexOf('0x791ac947')) && t.value.eq(ethers.BigNumber.from(0))) {
            // sell
            notifies += `sell - ${t.hash} || `
          }
        }

        // already finished
        last = lasting
      } catch (e) {
        console.error(e)
      }
    } while (false)

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
    { name: 'b', description: 'last block number' },
  ],
  action,
}
