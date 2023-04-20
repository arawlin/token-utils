const path = require('path')
const abiERC20 = require('@openzeppelin/contracts/build/contracts/ERC20.json').abi
const { DIR_RES_KEYSTORES } = require('../libs/constants')
const utils = require('../libs/etherUtils')

const action = async ({ d, p, t, to }, { ethers }) => {
  const dir = path.join(DIR_RES_KEYSTORES, d || process.env.DIR_KEYSTORE)
  const pass = p || process.env.PASS_KEYSTORE
  if (!pass) {
    throw new Error('params error')
  }

  const tt = t && new ethers.Contract(t, abiERC20, ethers.provider)
  if (!tt) {
    await utils.transferAll(ethers, dir, pass, to, '0.01')
  } else {
    await utils.transferTokenAll(ethers, tt, dir, pass, to, '10')
  }
}

module.exports = {
  name: 'transferAll',
  description: 'Transfer all assets in keystore dir',
  params: [
    { name: 'd', description: 'keystore dir name', defaultValue: '' },
    { name: 'p', description: 'keystore password', defaultValue: '' },
    { name: 't', description: 'address of token or null for the eth', defaultValue: '' },
    { name: 'to', description: 'transfer all to the address' },
  ],
  action,
}
