const fs = require('fs/promises')
const { DIR_RES_KEYSTORES } = require('../constants')

const action = async (args, hre) => {
  console.log(args)
}

module.exports = {
  name: 'balances',
  describtion: 'Prints all the balances in keystore dir',
  params: [
    { name: 'd', describtion: 'keystore dir name' },
    { name: 't', describtion: 'address of token or null for the eth', defaultValue: '' },
  ],
  action,
}
