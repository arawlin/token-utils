const { BigNumber, utils: ethersUtils } = require('ethers')
const { timeIntervalSec } = require('./index')
const logger = require('./logger').getLogger()

const abiUniswapV2Router02 = require('../abis/uniswap/UniswapV2Router02.json')
const abiUniversalRouter = require('../abis/uniswap/UniversalRouter.json')
const abiERC20 = require('@openzeppelin/contracts/build/contracts/ERC20.json').abi

const DELAY_DEADLINE = 120
const RATIO_MAX = BigNumber.from(100)
const RATIO_SLIPPAGE = BigNumber.from(20)
const MULITY_GAS_LIMIT = BigNumber.from(3)

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
const calcPriceToken = (amtQuot, decimalQuot, amtBase, decimalBase = 18) => {
  try {
    const q = Number(ethersUtils.formatUnits(amtQuot, decimalQuot))
    const b = Number(ethersUtils.formatUnits(amtBase, decimalBase))
    return ethersUtils.commify(q / b)
  } catch (e) {
    logger.error(e)
    return 0
  }
}

const approveRouter = async (ethers, addrToken) => {
  const signer = (await ethers.getSigners())[0]

  const token = new ethers.Contract(addrToken, abiERC20, signer)
  const balToken = await token.balanceOf(signer.address)
  const allowance = await token.allowance(signer.address, process.env.addrUniswapV2Router02)
  logger.info(`allowance - ${allowance.toString()}, balance - ${balToken.toString()}`)
  if (balToken.gt(allowance)) {
    const tx = await token.approve(process.env.addrUniswapV2Router02, ethers.constants.MaxUint256)
    logger.info(`approve - hash: ${tx.hash}`)
    // await tx.wait()
  }
}

const getAmountsOut = async (ethers, path, amountIn) => {
  const signer = (await ethers.getSigners())[0]
  const router = new ethers.Contract(process.env.addrUniswapV2Router02, abiUniswapV2Router02, signer)
  return await router.getAmountsOut(amountIn, path)
}

const swapExactETHForTokens = async (ethers, path, valueETH, gasPricePercent = RATIO_MAX, txLike, amountOutMin, needCheck = true) => {
  if (path[0] !== process.env.addrWETH) {
    throw new Error('swapExactETHForTokens error - path[0] must be WETH')
  }

  const signer = (await ethers.getSigners())[0]
  const router = new ethers.Contract(process.env.addrUniswapV2Router02, abiUniswapV2Router02, signer)

  const deadline = timeIntervalSec(DELAY_DEADLINE)

  // TODO: find the best path

  const value = ethers.utils.parseEther(valueETH)

  let gasPrice = await ethers.provider.getGasPrice()
  gasPrice = gasPrice.mul(gasPricePercent).div(RATIO_MAX)
  logger.info('gasPrice', ethers.utils.formatUnits(gasPrice, 'gwei'))

  if (!amountOutMin) {
    const amounts = await router.getAmountsOut(value, path)
    amountOutMin = amounts[path.length - 1].mul(RATIO_MAX.sub(RATIO_SLIPPAGE)).div(RATIO_MAX)
    // amountOutMin = ethers.constants.Zero
  }

  if (needCheck) {
    await router.estimateGas.swapExactETHForTokens(amountOutMin, path, signer.address, deadline, { value, gasPrice })
  }

  let gasLimitRaw
  if (txLike?.gasUsed) {
    gasLimitRaw = BigNumber.from(txLike.gasUsed)
  } else {
    gasLimitRaw = await router.estimateGas.swapExactETHForTokens(amountOutMin, path, signer.address, deadline, { value, gasPrice })
  }
  if (!gasLimitRaw) {
    logger.error('gasLimitRaw not set')
    return
  }

  const gasLimit = gasLimitRaw.mul(MULITY_GAS_LIMIT)
  logger.info('gasLimit', gasLimitRaw, gasLimit)

  logger.info(`swapExactETHForTokens - calling`)
  router.swapExactETHForTokens(amountOutMin, path, signer.address, deadline, { value, gasPrice, gasLimit }).then((tx) => {
    logger.info(`swapExactETHForTokens - hash: ${tx.hash}, value: ${valueETH}`)
    logger.info(`swapExactETHForTokens - called`)
  })

  // const tx = await router.swapExactETHForTokens(amountOutMin, path, signer.address, deadline, { value, gasPrice, gasLimit })
  // logger.info(`swapExactETHForTokens - hash: ${tx.hash}, value: ${valueETH}`)
  // const txr = await tx.wait()
  // logger.info(`swapExactETHForTokens - gasFee: ${ethers.utils.formatEther(tx.gasPrice.mul(txr?.gasUsed ?? ethers.constants.Zero))}`)

  // const addrToken = path[path.length - 1]
  // const token = new ethers.Contract(addrToken, abiERC20, signer)
  // const nmToken = await token.symbol()
  // const balToken = await token.balanceOf(signer.address)
  // const decimalToken = await token.decimals()
  // const priceToken = calcPriceToken(balToken, decimalToken, value)
  // logger.info(`${nmToken} - balToken: ${ethers.utils.formatUnits(balToken, decimalToken)}, price: ${priceToken.toString()}`)

  // return txr
}

const swapExactTokensForETHSupportingFeeOnTransferTokens = async (
  ethers,
  path,
  balancePercent = RATIO_MAX,
  gasPricePercent = RATIO_MAX,
  amountOutOverFee = '0.005',
  txLike,
) => {
  if (path[path.length - 1] !== process.env.addrWETH) {
    throw new Error('swapExactETHForTokens error - path[0] must be WETH')
  }

  const signer = (await ethers.getSigners())[0]
  const router = new ethers.Contract(process.env.addrUniswapV2Router02, abiUniswapV2Router02, signer)

  // deadline a little longer
  const deadline = timeIntervalSec(DELAY_DEADLINE * 2)

  const addrToken = path[0]
  const token = new ethers.Contract(addrToken, abiERC20, signer)
  const balToken = await token.balanceOf(signer.address)
  const amountIn = balToken.mul(balancePercent).div(RATIO_MAX)

  if (amountIn.eq(ethers.constants.Zero)) {
    return true
  }

  // swap the eth must over the gas fee, if not, don't sell
  const amounts = await router.getAmountsOut(amountIn, path)
  const amountOut = amounts[path.length - 1]
  if (amountOut.lt(ethers.utils.parseEther(amountOutOverFee))) {
    logger.warn(`amountOut:${ethers.utils.formatEther(amountOut)} is less then amountOutOverFee(${amountOutOverFee})`)
    return false
  }

  const amountOutMin = ethers.constants.Zero

  let gasPrice
  if (txLike?.gasPrice) {
    // add 1 gwei more than he
    gasPrice = ethers.BigNumber.from(txLike.gasPrice).add(ethers.utils.parseUnits('1', 'gwei'))
  } else {
    gasPrice = await ethers.provider.getGasPrice()
    gasPrice = gasPrice.mul(gasPricePercent).div(RATIO_MAX)
  }
  logger.info('gasPrice', ethers.utils.formatUnits(gasPrice, 'gwei'))

  let gasLimitRaw
  if (txLike?.gasUsed) {
    gasLimitRaw = BigNumber.from(txLike.gasUsed)
  } else {
    gasLimitRaw = await router.estimateGas.swapExactTokensForETHSupportingFeeOnTransferTokens(amountIn, amountOutMin, path, signer.address, deadline, {
      gasPrice,
    })
  }
  const gasLimit = gasLimitRaw.mul(MULITY_GAS_LIMIT)
  logger.info('gasLimit', gasLimitRaw, gasLimit)

  const tx = await router.swapExactTokensForETHSupportingFeeOnTransferTokens(amountIn, amountOutMin, path, signer.address, deadline, { gasPrice, gasLimit })
  logger.info(`swapExactTokensForETHSupportingFeeOnTransferTokens - hash: ${tx.hash}`)
  const txr = await tx.wait()
  // logger.info(`swapExactTokensForETHSupportingFeeOnTransferTokens - gasFee: ${ethers.utils.formatEther(tx.gasPrice.mul(txr?.gasUsed ?? ethers.constants.Zero))}`)

  return true
}

const swapExactTokensForTokens = async (ethers, path, amountIn, gasPricePercent = RATIO_MAX, txLike, amountOutMin) => {
  const signer = (await ethers.getSigners())[0]
  const router = new ethers.Contract(process.env.addrUniswapV2Router02, abiUniswapV2Router02, signer)

  const deadline = timeIntervalSec(DELAY_DEADLINE)

  let gasPrice = await ethers.provider.getGasPrice()
  gasPrice = gasPrice.mul(gasPricePercent).div(RATIO_MAX)
  logger.info('gasPrice', ethers.utils.formatUnits(gasPrice, 'gwei'))

  if (!amountOutMin) {
    const amounts = await router.getAmountsOut(amountIn, path)
    amountOutMin = amounts[path.length - 1].mul(RATIO_MAX.sub(RATIO_SLIPPAGE)).div(RATIO_MAX)
    // amountOutMin = ethers.constants.Zero
  }

  let gasLimitRaw = await router.estimateGas.swapExactTokensForTokens(amountIn, amountOutMin, path, signer.address, deadline, { gasPrice })
  if (txLike?.gasUsed) {
    gasLimitRaw = BigNumber.from(txLike.gasUsed)
  }
  if (!gasLimitRaw) {
    logger.error('gasLimitRaw not set')
    return
  }

  const gasLimit = gasLimitRaw.mul(MULITY_GAS_LIMIT)
  logger.info('gasLimit', gasLimitRaw, gasLimit)

  const tx = await router.swapExactTokensForTokens(amountIn, amountOutMin, path, signer.address, deadline, { gasPrice, gasLimit })
  const txr = await tx.wait()
  logger.info(`swapExactTokensForTokens - hash: ${tx.hash}, gasFee: ${ethers.utils.formatEther(tx.gasPrice.mul(txr?.gasUsed ?? ethers.constants.Zero))}`)

  const addrToken = path[path.length - 1]
  const token = new ethers.Contract(addrToken, abiERC20, signer)
  const nmToken = await token.symbol()
  const balToken = await token.balanceOf(signer.address)
  const decimalToken = await token.decimals()
  const priceToken = calcPriceToken(balToken, decimalToken, amountIn)
  logger.info(`${nmToken} - balToken: ${ethers.utils.formatUnits(balToken, decimalToken)}, price: ${priceToken.toString()}`)

  return txr
}

module.exports = {
  calcPriceToken,
  approveRouter,
  mapFuncHash,
  decodeABIUniswapV2Router02,
  getAmountsOut,
  swapExactETHForTokens,
  swapExactTokensForETHSupportingFeeOnTransferTokens,

  swapExactTokensForTokens,
}
