const fs = require('fs/promises')
const path = require('path')

const loadWallets = async (ethers, dir, pass, deal) => {
  console.log('loadWallets --------- ', dir)

  const ws = []
  const files = await fs.readdir(dir)
  for (const fn of files) {
    // if (!fn.endsWith('.keystore')) {
    //   continue
    // }
    try {
      const ct = await fs.readFile(path.join(dir, fn), { encoding: 'utf-8' })

      let w = await ethers.Wallet.fromEncryptedJson(ct, pass)
      w = w.connect(ethers.provider)
      deal && (await deal(w))

      ws.push(w)
    } catch (e) {
      console.error(e)
    }
  }
  console.log('loadWallets --------- count:', ws.length)
  return ws
}

const loadWalletsBalance = async (ethers, dir, pass, over = 0) => {
  console.log('loadWalletsBalance --------- ')

  let total = ethers.BigNumber.from('0')

  const wss = []
  const ws = await loadWallets(ethers, dir, pass)
  for (let i = 0; i < ws.length; ++i) {
    const w = ws[i]
    const b = await logBalance(ethers, w, i + ' - ')
    if (b.lt(ethers.BigNumber.from(over))) {
      console.log('less over', over)
      continue
    }

    total = total.add(b)
    wss.push(w)
  }
  console.log(`loadWalletsBalance - count: ${wss.length}, total: ${ethers.utils.formatEther(total)}`)
  return wss
}

const logBalance = async (ethers, signer, label = '') => {
  const bal = await signer.getBalance()
  console.log(label, signer.address, ethers.utils.formatEther(bal))
  return bal
}

module.exports = {
  loadWallets,
  loadWalletsBalance,
  logBalance,
}
