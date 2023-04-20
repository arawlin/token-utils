const path = require('path')
const abiERC20 = require('@openzeppelin/contracts/build/contracts/ERC20.json').abi
const { DIR_RES_KEYSTORES } = require('../libs/constants')
const utils = require('../libs/etherUtils')

const action = async ({ d, p, t, from, to, amount }, { ethers }) => {
  const dir = path.join(DIR_RES_KEYSTORES, d || process.env.DIR_KEYSTORE)
  const pass = p || process.env.PASS_KEYSTORE
  if (!pass) {
    throw new Error('params error')
  }

  const signer = await utils.loadWalletOne(ethers, dir, pass, from)
  if (!signer) {
    throw new Error(`param --from ${from} not found`)
  }

  const tt = t && new ethers.Contract(t, abiERC20, ethers.provider)
  if (!tt) {
    const amountRaw = amount === '-1' ? ethers.BigNumber.from(amount) : ethers.utils.parseEther(amount)
    await utils.transfer(ethers, signer, to, amountRaw)
  } else {
    const decimals = await tt.decimals()
    const amountRaw = amount === '-1' ? ethers.BigNumber.from(amount) : ethers.utils.parseUnits(amount, decimals)
    await utils.transferToken(ethers, tt, signer, to, amountRaw, decimals)
  }
}

module.exports = {
  name: 'transfer',
  description: 'Transfer a asset from addrFrom which is in the keystore dir to addrTo ',
  params: [
    { name: 'd', description: 'keystore dir name', defaultValue: '' },
    { name: 'p', description: 'keystore password', defaultValue: '' },
    { name: 't', description: 'address of token or null for the eth', defaultValue: '' },
    { name: 'from', description: 'transfer from the address' },
    { name: 'to', description: 'transfer to the address' },
    { name: 'amount', description: 'transfer amount. -1: all balance except fee, 0: param error, else the value must be great than 0' },
  ],
  action,
}
