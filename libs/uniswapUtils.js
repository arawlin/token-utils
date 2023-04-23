const { ethers } = require('hardhat')
const { timeInterval } = require('./index')

const abiUniswapV2Router02 = require('../abis/uniswap/UniswapV2Router02.json')
const abiUniversalRouter = require('../abis/uniswap/UniversalRouter.json')
const abiERC20 = require('@openzeppelin/contracts/build/contracts/ERC20.json').abi

const DELAY_DEADLINE = 120
const RATIO_MAX = ethers.BigNumber.from(100)
const RATIO_SLIPPAGE = ethers.BigNumber.from(10)

const buyETH = async (addrToken, valueETH, gasPricePercent = RATIO_MAX) => {
  const signer = (await ethers.getSigners())[0]
  const router = new ethers.Contract(process.env.addrUniswapV2Router02, abiUniswapV2Router02, signer)

  const deadline = timeInterval(DELAY_DEADLINE)

  // find the best path
  const path = [process.env.addrWETH, addrToken]

  let gasPrice = await ethers.provider.getGasPrice()
  gasPrice = gasPrice.mul(gasPricePercent)

  const amounts = await router.getAmountsOut(valueETH, path)
  const amountOutMin = amounts[path.length - 1].mul(RATIO_MAX.sub(RATIO_SLIPPAGE)).div(RATIO_MAX)

  const res = await router.swapExactETHForTokens(amountOutMin, path, signer.address, deadline, { value: valueETH, gasPrice })
  const rec = await res.wait()

  // approve first
}

const sellETH = async (addrToken, valuePercent, gasPricePercent = RATIO_MAX) => {
  //  balance enough
  // decimals
}

module.exports = {
  buyETH,
  sellETH,
}
