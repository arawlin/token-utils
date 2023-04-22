const { ethers } = require('hardhat')
const uni = require('../libs/uniswapUtils')

describe('uniswap', () => {
  it('contract overrides', async () => {
    const hash = '0x0a3b71b2eac59936a24190f3da839c658ef4fb6156109b2a86096a82cb041372'
    const tx = await ethers.provider.getTransaction(hash)
    console.log(tx)

    const tr = await ethers.provider.getTransactionReceipt(hash)
    console.log(tr)

    // gasPrice
  })

  it('buyETH', async () => {
    // await uni.buyETH(process.env.addrUniswapper)
  })
})
