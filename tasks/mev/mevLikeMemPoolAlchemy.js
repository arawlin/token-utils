const NAME_FILE = __filename.split('.')[0].slice(__dirname.length + 1)
const logger = require('../../libs/logger').getLogger()

const { sleep, timeOver, timeThen } = require('../../libs')
const dbTransaction = require('../../db/dbTransaction')

const action = async (_, { ethers, web3 }) => {
  logger.info('ethers', await ethers.provider.getNetwork())
  logger.info('web3', web3.currentProvider.url)
}

module.exports = {
  name: NAME_FILE,
  description: 'mev like mempool by alchemy',
  params: [],
  action,
}
