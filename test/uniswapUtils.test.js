const { ethers } = require('hardhat')
const uni = require('../libs/uniswapUtils')
const { filterABI } = require('../libs/etherUtils')

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
    console.log(block.timestamp, new Date(block.timestamp * 1000), new Date())

    // gasPrice
    const gasPrice = await ethers.provider.getGasPrice()
    console.log(gasPrice, ethers.utils.formatUnits(gasPrice, 'gwei'), 'gwei')
  })

  it('router info', async () => {
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
      '0x7ff36ab5000000000000000000000000000000000000008c4029798269a8291c58ce7a5a0000000000000000000000000000000000000000000000000000000000000080000000000000000000000000af2358e98683265cbd3a48509123d390ddf54534000000000000000000000000000000000000000000000000000000006444589e0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000769129cd93be6b979f500d1713167244d432bb2f'
    const abiFunc = filterABI(abiUniswapV2Router02, 'swapExactETHForTokens')
    console.log(abiFunc)

    const interface = new ethers.utils.Interface(abiUniswapV2Router02)
    const dataRipe = interface.decodeFunctionData('0x7ff36ab5', data)
    console.log(dataRipe)
  })

  it('uniswap sdk', async () => {})
})
