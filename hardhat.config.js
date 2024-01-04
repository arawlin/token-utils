require('dotenv').config()

require('@nomiclabs/hardhat-waffle')
require('@nomiclabs/hardhat-solhint')
require('hardhat-gas-reporter')
require('solidity-coverage')
require('@openzeppelin/hardhat-upgrades')
require('./plugins/hardhat-web3-ws')

require('./db').connect()
require('./libs/logger').init()

console.log('env -------------- ', process.env.NAME)

const taskWrap = (taskFunc, taskInfo) => {
  const definition = taskFunc(taskInfo.name, taskInfo.description)
  taskInfo.params?.forEach((i) => {
    if (!i.paramType) {
      definition.addParam(i.name, i.description, i.defaultValue, i.valueType)
    } else if (i.paramType === 'flag') {
      definition.addFlag(i.name, i.description)
    }
  })
  definition.setAction(taskInfo.action)
}

taskWrap(task, require('./tasks/accounts'))
taskWrap(task, require('./tasks/balances'))
taskWrap(task, require('./tasks/transfer'))
taskWrap(task, require('./tasks/transferAll'))
taskWrap(task, require('./tasks/eventAddress'))
taskWrap(task, require('./tasks/eventToken'))
taskWrap(task, require('./tasks/inscribe'))

taskWrap(task, require('./tasks/mev/mevLikeBlock'))
taskWrap(task, require('./tasks/mev/mevLikeMemPool'))
taskWrap(task, require('./tasks/mev/mevLikeMemPoolRPC'))
taskWrap(task, require('./tasks/mev/mevLikeMemPoolBloxRoute'))
taskWrap(task, require('./tasks/mev/mevLikeMemPoolAlchemy'))
taskWrap(task, require('./tasks/mev/mevICO'))

taskWrap(task, require('./tasks/mev/mevActSimple'))

module.exports = {
  // defaultNetwork: 'hardhat',
  defaultNetwork: 'inconfig',
  networks: {
    inconfig: {
      chainId: Number(process.env.ID_CHAIN),
      url: process.env.URL_RPC,
      urlws: process.env.URL_RPC_WS,
      accounts: process.env.ACCOUNTS ? process.env.ACCOUNTS.split(',') : undefined,
      timeout: 10000,
    },
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
    gasPrice: 20,
  },
  solidity: {
    version: '0.8.4',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  mocha: {
    timeout: 40000,
    parallel: false,
  },
}
