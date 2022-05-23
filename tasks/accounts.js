const action = async (args, hre) => {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address, hre.ethers.utils.formatEther(await account.getBalance()))
  }
}

module.exports = {
  name: 'accounts',
  describtion: 'Prints the list of accounts',
  action,
}
