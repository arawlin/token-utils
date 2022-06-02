const { expect } = require('chai')
const { ethers } = require('hardhat')
const path = require('path')

const fixtures = require('./fixtures')
const utils = require('../libs/etherUtils')
const { DIR_RES_KEYSTORES } = require('../libs/constants')

const dir = path.join(DIR_RES_KEYSTORES, 'test')
const pass = 'Qwe456'

describe('ether utils', () => {
  it.skip('createWallets', async () => {
    await utils.createWallets(ethers, dir, pass, 3)
  })

  it.skip('loadWallets', async () => {
    const dir = path.join(DIR_RES_KEYSTORES, 'test-load')
    const notInclude = async () => 0
    expect((await utils.loadWallets(ethers, dir, pass, notInclude)).length).be.equal(0)

    const allInclude = async () => 1
    expect((await utils.loadWallets(ethers, dir, pass, allInclude)).length).be.equal(3)

    const breakish = async (w, i) => {
      console.log(i, w.address)
      return i === 1 ? 2 : 1
    }
    expect((await utils.loadWallets(ethers, dir, pass, breakish)).length).be.equal(1)
  })

  it.skip('transfer', async () => {
    const ss = await ethers.getSigners()
    await utils.transfer(ethers, ss[0], ss[1].address, ethers.utils.parseUnits('1'))
  })

  it.skip('transferToken', async () => {
    const ss = await ethers.getSigners()
    const mockToken = await fixtures.loadMockToken('1000000')
    await utils.transferToken(ethers, mockToken, ss[0], ss[1].address, ethers.utils.parseUnits('1'))
  })

  it.skip('transferAll', async () => {
    const sf = await ethers.getSigners()
    const st = await utils.loadWallets(ethers, dir, pass, async () => 1)

    await utils.transfer(ethers, sf[1], st[0].address, ethers.utils.parseEther('1'))

    await utils.transferAll(ethers, dir, pass, sf[1].address)
  })
})
