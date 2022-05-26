require('dotenv').config()

require('@nomiclabs/hardhat-waffle')
require('@nomiclabs/hardhat-solhint')
// require('hardhat-gas-reporter')
require('solidity-coverage')

console.log('env -------------- ', process.env.NAME)

const taskWrap = (taskFunc, taskInfo) => {
  const definition = taskFunc(taskInfo.name, taskInfo.describtion)
  taskInfo.params?.forEach((i) => {
    definition.addParam(i.name, i.describtion, i.defaultValue, i.type)
  })
  definition.setAction(taskInfo.action)
}

taskWrap(task, require('./tasks/accounts'))
taskWrap(task, require('./tasks/balances'))
taskWrap(task, require('./tasks/transfer'))
taskWrap(task, require('./tasks/transferAll'))

module.exports = {
  defaultNetwork: 'hardhat',
  networks: {
    mainnet: {
      chainId: Number(process.env.ID_CHAIN),
      url: process.env.URL_RPC,
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
