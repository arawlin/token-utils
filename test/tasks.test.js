const { expect } = require('chai')
const { ethers, web3 } = require('hardhat')
const path = require('path')
const fixtures = require('./fixtures')
const utils = require('../libs/etherUtils')

const taskTransfer = require('../tasks/transfer')
const taskMevLikeMemPool = require('../tasks/mevLikeMemPool')

const { DIR_RES_KEYSTORES } = require('../libs/constants')

const dir = path.join(DIR_RES_KEYSTORES, 'test')
const pass = 'Qwe456'

describe('tasks', () => {
  it.skip('transfer token', async () => {
    const signers = await ethers.getSigners()
    const mockToken = await fixtures.loadMockToken('1000000')

    const amt = ethers.utils.parseEther('100')

    const ws = await utils.loadWallets(ethers, dir, pass, async () => 1)
    await utils.transfer(ethers, signers[0], ws[0].address, ethers.utils.parseEther('1'))
    await utils.transferToken(ethers, mockToken, signers[0], ws[0].address, amt)

    // await taskTransfer.action()
    await taskTransfer.action({ d: 'test', p: pass, t: mockToken.address, from: ws[0].address, to: ws[1].address, amount: '0' }, { ethers })
    expect(await mockToken.balanceOf(ws[1].address)).to.equal(amt)
  })

  it('mev like mem pool', async () => {
    await taskMevLikeMemPool.action({ mev: '' }, { ethers, web3 })
  })
})
