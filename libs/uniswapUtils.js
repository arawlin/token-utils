const { BigNumber, utils: ethersUtils } = require('ethers')
const { timeIntervalSec } = require('./index')

const abiUniswapV2Router02 = require('../abis/uniswap/UniswapV2Router02.json')
const abiUniversalRouter = require('../abis/uniswap/UniversalRouter.json')
const abiERC20 = require('@openzeppelin/contracts/build/contracts/ERC20.json').abi

const DELAY_DEADLINE = 120
const RATIO_MAX = BigNumber.from(100)
const RATIO_SLIPPAGE = BigNumber.from(10)
const TEN = BigNumber.from(10)

const mapFuncHash = {
  swapExactETHForTokens: '0x7ff36ab5',
  swapExactTokensForETHSupportingFeeOnTransferTokens: '0x791ac947',
}

const decodeABIUniswapV2Router02 = (ethers, func, data) => {
  const interface = new ethers.utils.Interface(abiUniswapV2Router02)
  return interface.decodeFunctionData(func, data)
}

/**
 * the price of token only for show in console
 *
 * @param {*} amtQuot
 * @param {*} decimalQuot
 * @param {*} amtBase
 * @param {*} decimalBase
 * @returns commify string of Number
 */
const priceToken = (amtQuot, decimalQuot, amtBase, decimalBase = 18) => {
  try {
    const q = Number(ethersUtils.formatUnits(amtQuot, decimalQuot))
    const b = Number(ethersUtils.formatUnits(amtBase, decimalBase))
    return ethersUtils.commify(q / b)
  } catch (e) {
    console.error('priceToken error', e)
    return 0
  }
}

const swapExactETHForTokens = async (ethers, path, valueETH, gasPricePercent = RATIO_MAX) => {
  if (path[0] !== process.env.addrWETH) {
    throw new Error('swapExactETHForTokens error - path[0] must be WETH')
  }

  const signer = (await ethers.getSigners())[0]
  const router = new ethers.Contract(process.env.addrUniswapV2Router02, abiUniswapV2Router02, signer)

  const deadline = timeIntervalSec(DELAY_DEADLINE)

  // TODO: find the best path

  const value = ethers.utils.parseEther(valueETH)

  let gasPrice = await ethers.provider.getGasPrice()
  gasPrice = gasPrice.mul(gasPricePercent)

  const amounts = await router.getAmountsOut(value, path)
  const amountOutMin = amounts[path.length - 1].mul(RATIO_MAX.sub(RATIO_SLIPPAGE)).div(RATIO_MAX)

  let tx = await router.swapExactETHForTokens(amountOutMin, path, signer.address, deadline, { value, gasPrice })
  let txr = await tx.wait()
  console.log(`swapExactETHForTokens - hash: ${tx.hash}, value: ${valueETH}, gas: ${ethers.utils.formatEther(tx.gasPrice.mul(txr.gasUsed))}`)

  const addrToken = path[path.length - 1]
  const token = new ethers.Contract(addrToken, abiERC20, signer)
  const nmToken = await token.symbol()
  const balToken = await token.balanceOf(signer.address)
  const decimalToken = await token.decimals()
  const priceToken = this.priceToken(balToken, decimalToken, value)
  console.log(`${nmToken} - balToken: ${ethers.utils.formatUnits(balToken, decimalToken)}, price: ${priceToken.toString()}`)

  // approve first
  tx = await token.approve(process.env.addrUniswapV2Router02, ethers.constants.MaxUint256)
  txr = await tx.wait()
  console.log(`approve - hash: ${tx.hash}`)

  return { token, balToken, value }
}

const swapExactTokensForETHSupportingFeeOnTransferTokens = async (
  ethers,
  path,
  balancePercent = RATIO_MAX,
  gasPricePercent = RATIO_MAX,
  amountOutOverFee = '0.005',
) => {
  if (path[path.length - 1] !== process.env.addrWETH) {
    throw new Error('swapExactETHForTokens error - path[0] must be WETH')
  }

  const signer = (await ethers.getSigners())[0]
  const router = new ethers.Contract(process.env.addrUniswapV2Router02, abiUniswapV2Router02, signer)

  let gasPrice = await ethers.provider.getGasPrice()
  gasPrice = gasPrice.mul(gasPricePercent)

  // deadline a little longer
  const deadline = timeIntervalSec(DELAY_DEADLINE * 2)

  const addrToken = path[0]
  const token = new ethers.Contract(addrToken, abiERC20, signer)
  const balToken = await token.balanceOf(signer.address)
  const amountIn = balToken.mul(balancePercent).div(RATIO_MAX)

  if (amountIn.eq(ethersUtils.constants.Zero)) {
    return true
  }

  // swap the eth must over the gas fee, if not, don't sell
  const amounts = await router.getAmountsOut(amountIn, path)
  const amountOut = amounts[path.length - 1]
  if (amountOut.lt(ethers.utils.parseEther(amountOutOverFee))) {
    console.log(
      `swapExactTokensForETHSupportingFeeOnTransferTokens - amountOut:${ethers.utils.formatEther(
        amountOut,
      )} is less then amountOutOverFee(${amountOutOverFee})`,
    )
    return false
  }

  const amountOutMin = ethers.constants.Zero

  const tx = await router.swapExactTokensForETHSupportingFeeOnTransferTokens(amountIn, amountOutMin, path, signer.address, deadline, { gasPrice })
  const txr = await tx.wait()
  console.log(`swapExactTokensForETHSupportingFeeOnTransferTokens - hash: ${tx.hash}, gas: ${ethers.utils.formatEther(tx.gasPrice.mul(txr.gasUsed))}`)

  return true
}

module.exports = {
  priceToken,
  mapFuncHash,
  decodeABIUniswapV2Router02,
  swapExactETHForTokens,
  swapExactTokensForETHSupportingFeeOnTransferTokens,
}
