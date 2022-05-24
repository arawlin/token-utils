const logBalance = async (ethers, signer) => {
  console.log(signer.address, ethers.utils.formatEther(await signer.getBalance()))
}

module.exports = {
  logBalance,
}
