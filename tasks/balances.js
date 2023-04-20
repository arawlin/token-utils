const path = require('path')
const abiERC20 = require('@openzeppelin/contracts/build/contracts/ERC20.json').abi
const { DIR_RES_KEYSTORES } = require('../libs/constants')
const utils = require('../libs/etherUtils')

const action = async ({ d, p, t }, { ethers }) => {
  const dir = path.join(DIR_RES_KEYSTORES, d || process.env.DIR_KEYSTORE)
  const pass = p || process.env.PASS_KEYSTORE
  const token = t || process.env.TOKEN_USDT
  if (!pass) {
    throw new Error('params error')
  }

  let tt
  if (token) {
    tt = new ethers.Contract(token, abiERC20, ethers.provider)
  }

  await utils.loadWalletsBalanceAll(ethers, dir, pass, tt)
}

module.exports = {
  name: 'balances',
  description: 'Prints all the balances in keystore dir',
  params: [
    { name: 'd', description: 'keystore dir name', defaultValue: '' },
    { name: 'p', description: 'keystore password', defaultValue: '' },
    { name: 't', description: 'address of token or null for the eth', defaultValue: '' },
  ],
  action,
}
