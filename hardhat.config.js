require('dotenv').config()

require('@nomiclabs/hardhat-waffle')
require('@nomiclabs/hardhat-solhint')
require('hardhat-gas-reporter')
require('solidity-coverage')

task(...require('./tasks/accounts'))

module.exports = {
  networks: {
    main: {
      url: process.env.URL_RPC,
    },
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
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
