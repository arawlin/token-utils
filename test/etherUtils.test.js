const { expect } = require('chai')
const { ethers } = require('hardhat')
const path = require('path')
const etherUtils = require('../libs/etherUtils')
const { DIR_RES_KEYSTORES } = require('../libs/constants')

describe('ether utils', () => {
  let mockToken

  before(async () => {
    const MockToken = await ethers.getContractFactory('MockToken')
    mockToken = await MockToken.deploy('Mock Token', 'MT', ethers.utils.parseEther('1000000'))
    await mockToken.deployed()

    console.log('mock token', mockToken.address, ethers.utils.formatEther(await mockToken.totalSupply()))
  })

  it.skip('loadWallets', async () => {
    const d = path.join(DIR_RES_KEYSTORES, 'a')
    const p = 'oAtsB5UZcrYKvEWK2ByY'

    const notInclude = async () => 0
    expect((await etherUtils.loadWallets(ethers, d, p, notInclude)).length).be.equal(0)

    const allInclude = async () => 1
    expect((await etherUtils.loadWallets(ethers, d, p, allInclude)).length).be.equal(3)

    const addrBreak = '0x0aa0142d140da685830f0a7327616c4d42455967'
    const breakish = async (w, i) => {
      console.log(i, w.address)
      return w.address.toLowerCase() === addrBreak ? 2 : 1
    }
    expect((await etherUtils.loadWallets(ethers, d, p, breakish)).length).be.equal(1)
  })

  it.skip('transfer', async () => {
    const ss = await ethers.getSigners()
    await etherUtils.transfer(ethers, ss[0], ss[1].address, ethers.utils.parseUnits('1'))
  })

  it.skip('transferToken', async () => {
    const ss = await ethers.getSigners()
    await etherUtils.transferToken(ethers, mockToken, ss[0], ss[1].address, ethers.utils.parseUnits('1'))
  })
})
