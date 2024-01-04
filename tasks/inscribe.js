const lib = require('../libs')
const utils = require('../libs/etherUtils')

const action = async (ps, { ethers }) => {
  const ordFunc = 'data:,{"p":"brc-20","op":"mint","tick":"lega","amt":"1000"}'
  const data = ethers.utils.toUtf8Bytes(ordFunc)
  console.log(data, ethers.utils.hexlify(data))

  const signer = (await ethers.getSigners())[0]
  let c = 58
  while (c-- > 0) {
    await utils.transfer(ethers, signer, signer.address, ethers.BigNumber.from(0), null, true, data)
    await lib.sleep(10 * 1000)
  }
}

module.exports = {
  name: 'inscribe',
  description: 'inscribe inscription',
  params: [],
  action,
}
