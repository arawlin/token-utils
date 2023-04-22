const { ethers } = require('hardhat')
const { timeInterval } = require('./index')

const abiUniswapV2Router02 = require('../abis/uniswap/UniswapV2Router02.json')
const abiUniversalRouter = require('../abis/uniswap/UniversalRouter.json')
const abiERC20 = require('@openzeppelin/contracts/build/contracts/ERC20.json').abi

const DELAY_DEADLINE = 120
const RATIO_SLIPPAGE = 0.1

const buyETH = async (addrToken, valueETH, addrSinger, gasPriceMultiply = 1) => {
  const signer = await ethers.getSigner(addrSinger)
  const router = new ethers.Contract(process.env.addrUniswapV2Router02, abiUniswapV2Router02, signer)

  const path = [process.env.addrWETH, addrToken]
  const dealline = timeInterval(DELAY_DEADLINE)

  const gasPrice = 0

  const amountOutMin = 0

  const res = await router.swapExactETHForTokens(amountOutMin, path, addrSinger, dealline, { value: valueETH, gasPrice })
  const rec = await res.wait()

  // approve first
}

module.exports = {
  buyETH,
}
