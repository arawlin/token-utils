const path = require('path')
const abiERC20 = require('@openzeppelin/contracts/build/contracts/ERC20.json').abi
const { DIR_RES_KEYSTORES } = require('../constants')
const utils = require('../libs/etherUtils')

const action = async ({ d, p, t, from, to }, { ethers }) => {
  const dir = path.join(DIR_RES_KEYSTORES, d || process.env.DIR_KEYSTORE)
  const pass = p || process.env.PASS_KEYSTORE
  if (!pass) {
    throw new Error('params error')
  }

  const tt = t && new ethers.Contract(t, abiERC20, ethers.provider)
  await utils.loadWallets(ethers, dir, pass, async (wallet, idx, fn) => {})
}

module.exports = {
  name: 'transfer',
  describtion: 'Transfer a asset from addrFrom which is in the keystore dir to addrTo ',
  params: [
    { name: 'd', describtion: 'keystore dir name', defaultValue: '' },
    { name: 'p', describtion: 'keystore password', defaultValue: '' },
    { name: 't', describtion: 'address of token or null for the eth', defaultValue: '' },
    { name: 'from', describtion: 'transfer from the address' },
    { name: 'to', describtion: 'transfer to the address' },
  ],
  action,
}
