const NAME_FILE = __filename.split('.')[0].slice(__dirname.length + 1)
const logger = require('../../libs/logger').getLogger()

const { sleep, timeNow, timeThen, timeElapse } = require('../../libs')
const uniswapUtils = require('../../libs/uniswapUtils')

const TIME_LOOP = 0.2 * 1000
const MULTI_AMOUNT_OUT_MIN = 10
const GAS_USED = 152121

const action = async ({ ico, amt }, { ethers, web3 }) => {
  logger.info('ethers', await ethers.provider.getNetwork())
  logger.info('web3', web3.currentProvider.url)

  const gasPricePercent = ethers.BigNumber.from(110)
  const path = [process.env.addrWETH, ico]

  // const amtIn = ethers.utils.parseUnits(amt)
  // const amountOuts = await uniswapUtils.getAmountsOut(ethers, path, amtIn)
  // const amtOutMin = ethers.BigNumber.from(amountOuts[1]).div(ethers.BigNumber.from(MULTI_AMOUNT_OUT_MIN))
  // logger.info(`amtOutRaw: ${amountOuts[1].toString()}, amtOut: ${ethers.utils.formatUnits(amountOuts[1], 9)}, amtOutMin: ${amtOutMin.toString()}`)

  const amtOutMin = ethers.BigNumber.from('44899015330643')

  let succ = false
  let last = await ethers.provider.getBlockNumber()
  while (true) {
    const timeStart = new Date().getTime()
    try {
      const cur = await ethers.provider.getBlockNumber()
      if (cur === last) {
        continue
      }
      last = cur

      // swap
      succ = await uniswapUtils.swapExactETHForTokens(ethers, path, amt, gasPricePercent, { gasUsed: ethers.BigNumber.from(GAS_USED) }, amtOutMin, true)
    } catch (e) {
      logger.error(last, e.code)
    }
    logger.info(last, `elapse - ${timeElapse(timeStart)}`, '--------------')

    if (succ) {
      break
    }

    await sleep(TIME_LOOP)
  }
}

module.exports = {
  name: NAME_FILE,
  description: 'mev ico competition',
  params: [
    { name: 'ico', description: 'address of ico token' },
    { name: 'amt', description: 'amount costed eth, i.e. 1 eth' },
  ],
  action,
}
