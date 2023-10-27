const NAME_FILE = __filename.split('.')[0].slice(__dirname.length + 1)
const logger = require('../../libs/logger').getLogger()

const { sleep, timeNow, timeThen, timeElapse } = require('../../libs')
const uniswapUtils = require('../../libs/uniswapUtils')
const etherUtils = require('../../libs/etherUtils')

const TIME_LOOP = 0.5 * 1000
const MULTI_AMOUNT_OUT_MIN = 10
const GAS_USED = 193471
const GAS_PRICE_PERCENT = 110

const action = async ({ ico, amt }, { ethers, web3 }) => {
  logger.info('ethers', await ethers.provider.getNetwork())
  // logger.info('web3', web3.currentProvider.url)

  const signer = (await ethers.getSigners())[0]
  const addrSigner = await signer.getAddress()
  await etherUtils.logBalance(ethers, addrSigner, 'signer')

  const gasPricePercent = ethers.BigNumber.from(GAS_PRICE_PERCENT)
  const path = [process.env.addrWETH, ico]

  // const amtIn = ethers.utils.parseUnits(amt)
  // const amountOuts = await uniswapUtils.getAmountsOut(ethers, path, amtIn)
  // const amtOutMin = ethers.BigNumber.from(amountOuts[1]).div(ethers.BigNumber.from(MULTI_AMOUNT_OUT_MIN))
  // logger.info(`amtOutRaw: ${amountOuts[1].toString()}, amtOut: ${ethers.utils.formatUnits(amountOuts[1], 9)}, amtOutMin: ${amtOutMin.toString()}`)

  const amtOutMin = ethers.BigNumber.from('1033094761703660')

  let last = await ethers.provider.getBlockNumber()
  while (true) {
    const timeStart = new Date().getTime()
    try {
      const cur = await ethers.provider.getBlockNumber()
      logger.info(last, '--------------')
      if (cur === last) {
        continue
      }
      last = cur

      // swap
      await uniswapUtils.swapExactETHForTokens(ethers, path, amt, gasPricePercent, { gasUsed: ethers.BigNumber.from(GAS_USED) }, amtOutMin, false)
    } catch (e) {
      logger.error(last, e)
    }
    logger.info(last, `elapse - ${timeElapse(timeStart)}`, '--------------')

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
