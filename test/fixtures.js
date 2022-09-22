const { ethers, waffle } = require('hardhat')

const deploy = async (nmContract, params = [], libraries = {}) => {
  const factory = await ethers.getContractFactory(nmContract, { libraries })
  const contract = await factory.deploy(...params)
  await contract.deployed()
  console.log(`deploy - ${nmContract} - ${params} - ${contract.address}`)
  return contract
}

const loadMockToken = async (totalSupply) => {
  return await waffle.loadFixture(async () => {
    const MockToken = await ethers.getContractFactory('MockToken')
    const mockToken = await MockToken.deploy('Mock Token', 'MT', ethers.utils.parseEther(totalSupply))
    await mockToken.deployed()

    console.log('mock token', mockToken.address, ethers.utils.formatEther(await mockToken.totalSupply()))
    return mockToken
  })
}

module.exports = {
  loadMockToken,
  deploy,
}
