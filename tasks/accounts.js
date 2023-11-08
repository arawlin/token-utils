const path = require('path')
const fs = require('node:fs/promises')
const { DIR_RES_KEYSTORES } = require('../libs/constants')
const utils = require('../libs/etherUtils')

const action = async ({ d, p, c, n, s }, { ethers }) => {
  const dir = path.join(DIR_RES_KEYSTORES, d || process.env.DIR_KEYSTORE)
  await fs.mkdir(dir, { recursive: true })

  const pass = p || process.env.PASS_KEYSTORE
  if (!pass) {
    throw new Error('params error')
  }

  if (c) {
    await utils.createWallets(ethers, dir, pass, Number(n))
  }
  if (s) {
    await utils.loadWallets(ethers, dir, pass, async (w, i, f) => {
      console.log(`address: ${w.address}, ${w.publicKey} - ${w.privateKey} - ${i}`)
    })
  }
}

module.exports = {
  name: 'accounts',
  description: 'Operate accounts',
  params: [
    { name: 'd', description: 'keystore dir name', defaultValue: '' },
    { name: 'p', description: 'keystore password', defaultValue: '' },
    { name: 'c', description: 'create accounts', paramType: 'flag' },
    { name: 's', description: 'show accounts', paramType: 'flag' },
    { name: 'n', description: 'How many accounts need to be created', defaultValue: '0' },
  ],
  action,
}
