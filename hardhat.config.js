require('dotenv').config()

require('@nomiclabs/hardhat-waffle')
require('@nomiclabs/hardhat-solhint')
// require('hardhat-gas-reporter')
require('solidity-coverage')
require('@openzeppelin/hardhat-upgrades')
require('./plugins/hardhat-web3-ws')

require('./db').connect()

console.log('env -------------- ', process.env.NAME)

const taskWrap = (taskFunc, taskInfo) => {
  const definition = taskFunc(taskInfo.name, taskInfo.describtion)
  taskInfo.params?.forEach((i) => {
    if (!i.paramType) {
      definition.addParam(i.name, i.describtion, i.defaultValue, i.valueType)
    } else if (i.paramType === 'flag') {
      definition.addFlag(i.name, i.describtion)
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

module.exports = {
  defaultNetwork: 'hardhat',
  networks: {
    inconfig: {
      chainId: Number(process.env.ID_CHAIN),
      url: process.env.URL_RPC,
      accounts: process.env.ACCOUNTS ? process.env.ACCOUNTS.split(',') : undefined,
    },
  },
  // gasReporter: {
  //   enabled: true,
  //   currency: 'USD',
  // },
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
