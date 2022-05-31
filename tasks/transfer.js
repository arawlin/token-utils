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

  const tt = t && new ethers.Contract(t, abiERC20, ethers.provider)
  let amountRaw = ethers.utils.parseEther(amount)

  const signer = await utils.loadWalletOne(ethers, dir, pass, from)
  if (!signer) {
    throw new Error(`param --from ${from} not found`)
  }

  if (!tt) {
    // if amount is 0, then transfer the rest balance
    if (amountRaw.lte(ethers.BigNumber.from('0'))) {
      const feeData = await ethers.provider.getFeeData()
      const GAS_LIMIT = ethers.BigNumber.from('21001')
      const GAS_FEE = GAS_LIMIT.mul(feeData.maxFeePerGas)

      const bal = await utils.logBalance(ethers, from)

      amountRaw = bal.sub(GAS_FEE)
    }

    await utils.transfer(ethers, signer, to, amountRaw)
  } else {
    const decimals = await tt.decimals()
    await utils.transferToken(ethers, tt, signer, to, amountRaw, decimals)
  }
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
    { name: 'amount', describtion: 'transfer amount' },
  ],
  action,
}
