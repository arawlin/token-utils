const path = require('path')
const { DIR_RES_KEYSTORES } = require('../constants')
const utils = require('../libs/etherUtils')

const action = async ({ d, p, t }, { ethers }) => {
  const dir = path.join(DIR_RES_KEYSTORES, d || process.env.DIR_KEYSTORE)
  const pass = p || process.env.PASS_KEYSTORE
  if (!pass) {
    throw new Error('params error')
  }

  await utils.loadWalletsBalance(ethers, dir, pass)
}

module.exports = {
  name: 'balances',
  describtion: 'Prints all the balances in keystore dir',
  params: [
    { name: 'd', describtion: 'keystore dir name', defaultValue: '' },
    { name: 'p', describtion: 'keystore password', defaultValue: '' },
    { name: 't', describtion: 'address of token or null for the eth', defaultValue: '' },
  ],
  action,
}
