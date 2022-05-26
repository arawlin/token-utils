const { expect } = require('chai')
const { ethers } = require('hardhat')
const etherUtils = require('../libs/etherUtils')

describe('ether utils', function () {
  it('transfer', async function () {
    const ss = await ethers.getSigners()
    await etherUtils.transfer(ethers, ss[0], ss[1].address, ethers.utils.parseUnits('1'))
  })
})
