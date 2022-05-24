const fs = require('fs/promises')
const path = require('path')
const { DIR_RES_KEYSTORES } = require('../constants')
const utils = require('../libs/utils')

const action = async ({ d, p, t }, { ethers }) => {
  const dir = path.join(DIR_RES_KEYSTORES, d || process.env.DIR_KEYSTORE)
  const pass = p || process.env.PASS_KEYSTORE
  if (!pass) {
    throw new Error('params error')
  }

  const ws = []
  const files = await fs.readdir(dir)
  for (const fn of files) {
    if (!fn.endsWith('.keystore')) {
      continue
    }
    const ct = await fs.readFile(path.join(dir, fn), { encoding: 'utf-8' })
    const w = await ethers.Wallet.fromEncryptedJson(ct, pass)
    ws.push(w.connect(ethers.provider))
  }
  for (const w of ws) {
    await utils.logBalance(ethers, w)
  }
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
