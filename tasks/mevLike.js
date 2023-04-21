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

      const bt = await ethers.provider.getBlockWithTransactions(lasting)
      if (!bt) {
        break
      }
      last = lasting

      for (const t of bt.transactions) {
        if (t.from.toLowerCase() !== a.toLowerCase()) {
          continue
        }
        console.log({ hash: t.hash, to: t.to, gasPrice: ethers.utils.formatUnits(t.gasPrice, 'gwei'), value: ethers.utils.formatEther(t.value), data: t.data })

        if ((t.data.indexOf('0x3593564c') || t.data.indexOf('0x7ff36ab5')) && t.value.gt(ethers.BigNumber.from(0))) {
          // buy
          notifies += `buy - ${Number(ethers.utils.formatEther(t.value)).toFixed(4)}eth ${t.hash}</a> || `
        } else if ((t.data.indexOf('0x3593564c') || t.data.indexOf('0x791ac947')) && t.value.eq(ethers.BigNumber.from(0))) {
          // sell
          notifies += `sell - ${t.hash}</a> || `
        }
      }
    } while (false)

    // console.log(tos)
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
