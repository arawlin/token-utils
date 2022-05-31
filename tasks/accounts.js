const path = require('path')
const { DIR_RES_KEYSTORES } = require('../libs/constants')
const utils = require('../libs/etherUtils')

const action = async ({ d, p, c, n }, { ethers }) => {
  const dir = path.join(DIR_RES_KEYSTORES, d || process.env.DIR_KEYSTORE)
  const pass = p || process.env.PASS_KEYSTORE
  if (!pass) {
    throw new Error('params error')
  }

  if (c) {
    await utils.createWallets(ethers, dir, pass, Number(n))
  }
}

module.exports = {
  name: 'accounts',
  describtion: 'Operate accounts',
  params: [
    { name: 'd', describtion: 'keystore dir name', defaultValue: '' },
    { name: 'p', describtion: 'keystore password', defaultValue: '' },
    { name: 'c', describtion: 'create accounts', paramType: 'flag' },
    { name: 'n', describtion: 'How many accounts need to be created' },
  ],
  action,
}
