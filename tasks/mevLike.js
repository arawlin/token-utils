const { sleep } = require('../libs')

const action = async ({ a }, { ethers }) => {
  if (!a) {
    console.log('address not config')
    return
  }

  let last = 0
  while (true) {
    do {
      const b = await ethers.provider.getBlockNumber()
      if (b === last) {
        break
      }
      last = b
      console.log(last)

      const bt = await ethers.provider.getBlockWithTransactions()
      for (const t of bt.transactions) {
        if (t.from.toLowerCase() !== a.toLowerCase()) {
          continue
        }
        console.log(t)
        // const btr = await ethers.provider.getTransactionReceipt(t.hash)
        // console.log(btr)
      }
    } while (false)

    await sleep(1 * 1000)
  }
}

module.exports = {
  name: 'mevLike',
  description: 'mev like others',
  params: [{ name: 'a', description: 'address of mev', defaultValue: '' }],
  action,
}
