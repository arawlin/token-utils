const { sleep } = require('../libs')

const action = async ({ a, b }, { ethers }) => {
  if (!a) {
    console.log('address not config')
    return
  }

  const tos = new Set()
  let last = 0
  while (true) {
    do {
      const cur = await ethers.provider.getBlockNumber()
      if (cur === last) {
        break
      }
      if (b && b < cur) {
        last = b++
      } else {
        last = cur
        b = undefined
      }
      console.log(last, cur)

      const bt = await ethers.provider.getBlockWithTransactions(last)
      for (const t of bt.transactions) {
        if (t.from.toLowerCase() !== a.toLowerCase()) {
          continue
        }
        console.log({ hash: t.hash, to: t.to, gasPrice: ethers.utils.formatUnits(t.gasPrice, 'gwei'), value: ethers.utils.formatEther(t.value), data: t.data })

        tos.add(t.to)
      }
    } while (false)

    console.log(tos)

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
