const { ethers } = require('hardhat')
const libs = require('../libs')
const uni = require('../libs/uniswapUtils')
const { filterABI } = require('../libs/etherUtils')
const dbTransaction = require('../db/dbTransaction')

const abiUniswapV2Router02 = require('../abis/uniswap/UniswapV2Router02.json')
const abiERC20 = require('@openzeppelin/contracts/build/contracts/ERC20.json').abi

describe('uniswap', () => {
  it.skip('contract overrides', async () => {
    const hash = '0xd7c0d2a5aa3b6697e03f8d6a0c16503d29d9059199e763500f21f1480b88bbd5'
    const tx = await ethers.provider.getTransaction(hash)
    console.log(tx)
    console.log(tx.timestamp)

    const tr = await ethers.provider.getTransactionReceipt(hash)
    console.log(tr)

    const block = await ethers.provider.getBlock(await ethers.provider.getBlockNumber())
    console.log(block)
    console.log(ethers.utils.formatUnits(block.baseFeePerGas, 'gwei'), 'gwei')
    console.log(block.timestamp, new Date().getTime() / 1000, new Date(block.timestamp * 1000), new Date())

    // gasPrice
    const gasPrice = await ethers.provider.getGasPrice()
    console.log(gasPrice, ethers.utils.formatUnits(gasPrice, 'gwei'), 'gwei')
  })

  it.skip('router info', async () => {
    // usdt - 0xdAC17F958D2ee523a2206206994597C13D831ec7
    const addrToken = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    const token = new ethers.Contract(addrToken, abiERC20, ethers.provider)
    const symbol = await token.symbol()
    const decimals = await token.decimals()
    console.log(symbol, decimals)

    const router = new ethers.Contract(process.env.addrUniswapV2Router02, abiUniswapV2Router02, ethers.provider)
    const amountIn = ethers.utils.parseEther('1')
    const path = [process.env.addrWETH, addrToken]
    const amounts = await router.getAmountsOut(amountIn, path)
    console.log(ethers.utils.commify(amounts[path.length - 1]))
    console.log(ethers.utils.formatUnits(amounts[path.length - 1], decimals))

    const data =
      '0x7ff36ab500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000080000000000000000000000000f2fa228eac1d18462384ffa1a8eb6732e2201be9000000000000000000000000000000000000000000000000000000006448fd880000000000000000000000000000000000000000000000000000000000000002000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec7'
    const abiFunc = filterABI(abiUniswapV2Router02, 'swapExactETHForTokens')
    console.log(abiFunc)

    const interface = new ethers.utils.Interface(abiUniswapV2Router02)
    let dataRipe = interface.decodeFunctionData('0x7ff36ab5', data)
    console.log(dataRipe)

    dataRipe = uni.decodeABIUniswapV2Router02(ethers, 'swapExactETHForTokens', data)
    console.log(dataRipe)
    console.log(dataRipe.path)
  })

  it.skip('transaction', async () => {
    const hash = '0xde3f8c490d51f404f434d9f1165f8b80767fa6b0249fb0a127269a364dadb59e'
    const tx = await ethers.provider.getTransaction(hash)
    const txr = await ethers.provider.getTransactionReceipt(hash)

    console.log(tx.gasPrice.toString(), txr.gasUsed.toString(), ethers.utils.formatEther(tx.gasPrice.mul(txr.gasUsed)))
  })

  it.skip('token', async () => {
    const value = ethers.utils.parseEther('0.075')
    const token = new ethers.Contract('0xb3780849Cc89c75B72d215d4C4585E8a3FE7CDB7', abiERC20, ethers.provider)
    const nmToken = await token.symbol()
    const balToken = await token.balanceOf('0xAf2358e98683265cBd3a48509123d390dDf54534')
    const decimalToken = await token.decimals()
    const priceToken = uni.priceToken(balToken, decimalToken, value)

    console.log(nmToken, ethers.utils.formatUnits(balToken, decimalToken), value, priceToken.toString(), ethers.constants.MaxUint256.toHexString())
  })

  it.skip('mongdb transaction', async () => {
    let idLast
    while (true) {
      const txs = await dbTransaction.findLast('0xAf2358e98683265cBd3a48509123d390dDf54534', idLast, 2 * 3600 * 1000, 2)
      if (!txs || txs.length === 0) {
        break
      }
      idLast = txs[txs.length - 1]._id

      console.log('------', idLast, txs.length, txs)
    }
  })

  it('uniswap sdk', async () => {})

  it.skip('splice in for', async () => {
    const a = [1, 2, 3]
    for (let i = 0; i < a.length; ++i) {
      console.log(a.length, i)
      if (a[i] === 2) {
        a.splice(i, 1)
        --i
        console.log(a.length, i)
      }
    }
    console.log(a)
  })

  it.skip('swap', async () => {
    const signer = (await ethers.getSigners())[0]
    const bal = await signer.getBalance()
    console.log('bal', signer.address, ethers.utils.formatEther(bal))

    const path = [process.env.addrWETH, '0xdAC17F958D2ee523a2206206994597C13D831ec7']

    // await uni.swapExactETHForTokens(ethers, path, '0.005')

    // await uni.approveRouter(ethers, path[path.length - 1])
    // await uni.swapExactTokensForETHSupportingFeeOnTransferTokens(ethers, path.reverse(), ethers.BigNumber.from(100), ethers.BigNumber.from(100))
  })

  it.skip('check sell', async () => {
    const data =
      '0x791ac947000000000000000000000000000000000000000003b474e081a3442cf0a731820000000000000000000000000000000000000000000000000536e9bc04f5d69b00000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000af2358e98683265cbd3a48509123d390ddf54534000000000000000000000000000000000000000000000000000000006449fb9200000000000000000000000000000000000000000000000000000000000000020000000000000000000000005227a63fd11ada420f25d2f5bf505a6fa365f356000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
    const dataRipe = uni.decodeABIUniswapV2Router02(ethers, 'swapExactTokensForETHSupportingFeeOnTransferTokens', data)
    console.log(dataRipe)

    console.log(dataRipe.path)
    console.log(libs.reverseArrayConst(dataRipe.path))

    const arr = [1, 2, 3, 4]
    console.log(arr, libs.reverseArrayConst(arr))

    const gasPrice = ethers.BigNumber.from('32937405476').add(ethers.utils.parseUnits('1', 'gwei'))
    console.log('gasPrice', ethers.utils.formatUnits(gasPrice, 'gwei'))
  })
})
