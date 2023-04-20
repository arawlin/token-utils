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
  description: 'Operate accounts',
  params: [
    { name: 'd', description: 'keystore dir name', defaultValue: '' },
    { name: 'p', description: 'keystore password', defaultValue: '' },
    { name: 'c', description: 'create accounts', paramType: 'flag' },
    { name: 'n', description: 'How many accounts need to be created' },
  ],
  action,
}
