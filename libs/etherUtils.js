const fs = require('fs/promises')
const path = require('path')

const loadWallets = async (ethers, dir, pass, deal) => {
  console.log('loadWallets --------- ', dir)

  let idx = 0
  const ws = []
  const files = await fs.readdir(dir)
  for (const fn of files) {
    // if (!fn.endsWith('.keystore')) {
    //   continue
    // }

    ++idx
    try {
      const ct = await fs.readFile(path.join(dir, fn), { encoding: 'utf-8' })

      let w = await ethers.Wallet.fromEncryptedJson(ct, pass)
      w = w.connect(ethers.provider)

      let include = true
      if (deal) {
        include = await deal(w, idx, fn)
      }

      if (include) {
        ws.push(w)
      }
    } catch (e) {
      console.error(`${fn} - ${e}`)
    }
  }
  console.log('loadWallets --------- count:', ws.length)
  return ws
}

const loadWalletsBalance = async (ethers, dir, pass, over = 0) => {
  console.log('loadWalletsBalance --------- ')

  let total = ethers.BigNumber.from('0')
  const wss = await loadWallets(ethers, dir, pass, async (w, i, f) => {
    const b = await logBalance(ethers, w, `${i} - ${f} -`)
    const include = b.gte(ethers.BigNumber.from(over))
    if (include) {
      total = total.add(b)
    }
    return include
  })
  console.log(`loadWalletsBalance - count: ${wss.length}, total: ${ethers.utils.formatEther(total)}`)
  return wss
}

const loadWalletsBalanceAll = async (ethers, dir, pass, token) => {
  console.log('loadWalletsBalanceAll --------- ')

  const decimals = (token && (await token.decimals())) ?? 18

  let total = ethers.BigNumber.from('0')
  let totalToken = ethers.BigNumber.from('0')
  const wss = await loadWallets(ethers, dir, pass, async (w, i, f) => {
    const b = await logBalance(ethers, w, `${i} - ${f} -`)
    total = total.add(b)

    if (token) {
      const bt = await logBalanceToken(ethers, token, w, `${i} token -`, decimals)
      totalToken = totalToken.add(bt)
    }

    return true
  })
  console.log(
    `loadWalletsBalanceAll - count: ${wss.length}, total: ${ethers.utils.formatEther(
      total,
    )}, totalToken: ${ethers.utils.formatEther(totalToken)}`,
  )
  return wss
}

const loadWalletsBalanceSyn = async (ethers, dir, pass, over = 0) => {
  console.log('loadWalletsBalanceSyn --------- ')

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
  console.log(`loadWalletsBalanceSyn - count: ${wss.length}, total: ${ethers.utils.formatEther(total)}`)
  return wss
}

const logBalance = async (ethers, signer, label = '') => {
  const bal = await signer.getBalance()
  console.log(label, signer.address, ethers.utils.formatEther(bal))
  return bal
}

const logBalanceToken = async (ethers, contract, signer, label = '', decimals = 18) => {
  const bal = await contract.balanceOf(signer.address)
  console.log(label, signer.address, ethers.utils.formatUnits(bal, decimals))
  return bal
}

const transfer = async (ethers, signer, to, value) => {
  const req = { to, value }
  const res = await signer.sendTransaction(req)
  const rec = await res.wait()
  console.log(req, res, rec)
}

module.exports = {
  loadWallets,
  loadWalletsBalance,
  loadWalletsBalanceAll,
  loadWalletsBalanceSyn,
  logBalance,
  logBalanceToken,

  transfer,
}
