const fs = require('fs/promises')
const path = require('path')
const { DEBUG } = require('./constants')

const loadWalletOne = async (ethers, dir, pass, address) => {
  let wallet
  await loadWallets(ethers, dir, pass, async (w, i) => {
    if (w.address.toLowerCase() === address.toLowerCase()) {
      console.log(i, w.address)
      wallet = w
      return 2
    }
    return 0
  })
  return wallet
}

/**
 * load all wallets in keystore dir
 *
 * @param {*} ethers
 * @param {*} dir
 * @param {*} pass
 * @param {*} deal - async (wallet, idx, keystoreFileName) => Promise<Number> - 0: not include, 1: include, 2: break loading loop
 * @returns the promise of the array of wallets
 */
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

      const res = (await deal(w, idx, fn)) ?? 0
      if (res === 1) {
        ws.push(w)
      } else if (res === 2) {
        break
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
    const b = await logBalance(ethers, w.address, `${i} - ${f} -`)
    const include = b.gte(ethers.BigNumber.from(over))
    if (include) {
      total = total.add(b)
    }
    return include ? 1 : 0
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
    const b = await logBalance(ethers, w.address, `${i} - ${f} -`)
    total = total.add(b)

    if (token) {
      const bt = await logBalanceToken(ethers, token, w.address, `${i} token -`, decimals)
      totalToken = totalToken.add(bt)
    }

    return 1
  })
  console.log(
    `loadWalletsBalanceAll - count: ${wss.length}, total: ${ethers.utils.formatEther(total)}, totalToken: ${ethers.utils.formatUnits(totalToken, decimals)}`,
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
    const b = await logBalance(ethers, w.address, i + ' -')
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

const logBalance = async (ethers, address, label = '') => {
  const bal = await ethers.provider.getBalance(address)
  console.log(label, address, ethers.utils.formatEther(bal))
  return bal
}

const logBalanceToken = async (ethers, contract, address, label = '', decimals = 18) => {
  const bal = await contract.balanceOf(address)
  console.log(label, address, ethers.utils.formatUnits(bal, decimals))
  return bal
}

const transfer = async (ethers, signer, to, value) => {
  console.log('transfer --------- ')
  const bal = await logBalance(ethers, signer.address, 'from -')
  await logBalance(ethers, to, 'to -')

  if (bal.lt(value)) {
    console.log(`not enough balance ${ethers.utils.formatEther(bal)} - ${ethers.utils.formatEther(value)}`)
    return false
  }

  const gasLimit = ethers.BigNumber.from('21001')
  const gasPrice = await signer.getGasPrice()

  const req = { to, value, gasPrice, gasLimit }
  const res = await signer.sendTransaction(req)
  const rec = await res.wait()
  DEBUG && console.log(req, res, rec)

  await logBalance(ethers, signer.address, 'from -')
  await logBalance(ethers, to, 'to -')

  return true
}

const transferToken = async (ethers, contract, signer, to, amount, decimals = 18) => {
  console.log('transferToken --------- ')
  const bal = await logBalanceToken(ethers, contract, signer.address, 'from -', decimals)
  await logBalanceToken(ethers, contract, to, 'to -', decimals)

  if (bal.lt(amount)) {
    console.log(`not enough balance ${ethers.utils.formatUnits(bal, decimals)} - ${ethers.utils.formatUnits(amount, decimals)}`)
    return false
  }

  contract = contract.connect(signer)
  const res = await contract.transfer(to, amount)
  const rec = await res.wait()
  DEBUG && console.log(res, rec)

  await logBalanceToken(ethers, contract, signer.address, 'from -', decimals)
  await logBalanceToken(ethers, contract, to, 'to -', decimals)

  return true
}

const transferAll = async (ethers, dir, pass, to) => {
  console.log('transferAll --------- ')

  await logBalance(ethers, to, 'to -')
  const mini = ethers.utils.parseEther('0.01')

  // fee
  const GAS_LIMIT = ethers.BigNumber.from('21001')
  const GAS_PRICE = await ethers.provider.getGasPrice()
  const GAS_FEE = GAS_LIMIT.mul(GAS_PRICE)
  console.log(
    `GAS_LIMIT: ${GAS_LIMIT.toString()},`,
    `GAS_PRICE: ${ethers.utils.formatUnits(GAS_PRICE, 'gwei')} gwei,`,
    `GAS_FEE: ${ethers.utils.formatUnits(GAS_FEE, 'ether')} ether`,
  )

  let total = ethers.BigNumber.from('0')
  await loadWallets(ethers, dir, pass, async (wallet, idx, fn) => {
    try {
      // balance enough?
      const bal = await logBalance(ethers, wallet.address, `${idx} -`)
      const rest = bal.sub(GAS_FEE)
      if (rest.lt(mini)) {
        console.log(`rest value less than ${ethers.utils.formatEther(mini)}`)
        return 0
      }

      // transfer to
      const suc = await transfer(ethers, wallet, to, rest)
      if (!suc) {
        return 0
      }

      total = total.add(rest)
      return 1
    } catch (e) {
      console.error(e)
    }
  })

  await logBalance(ethers, to, 'to -')
  console.log(`transferAll --------- total: ${ethers.utils.formatEther(total)}`)
}

const transferTokenAll = async (ethers, contract, dir, pass, to, excludes = []) => {
  console.log('transferTokenAll --------- ')

  const decimals = await contract.decimals()
  await loadWallets(ethers, dir, pass, async (wallet, idx, fn) => {
    // excluded?
    if (excludes.includes(wallet.address)) {
      console.log(`${idx} - ${wallet.address} - is in excludes`)
      return 0
    }

    // balance enough?
    const bal = await logBalanceToken(ethers, contract, wallet.address, `${idx} -`, decimals)
    if (bal.lte(ethers.BigNumber.from('0'))) {
      console.log(`${idx} - ${wallet.address} - has not enough balance`)
      return 0
    }

    // TODO
    // fee enough?

    // transfer to
  })
}

module.exports = {
  loadWalletOne,
  loadWallets,
  loadWalletsBalance,
  loadWalletsBalanceAll,
  loadWalletsBalanceSyn,
  logBalance,
  logBalanceToken,

  transfer,
  transferToken,
  transferAll,
  transferTokenAll,
}
