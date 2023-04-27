const { sleep, reverseArrayConst, timeOver } = require('../libs')
const emailSend = require('../libs/emailSend')
const uniswapUtils = require('../libs/uniswapUtils')
const dbTransaction = require('../db/dbTransaction')

const TIME_LOOP = 1 * 1000

const NUM_QUERY = 10
// const DEADLINE_QUERY = 15 * 1000
const DEADLINE_QUERY = 10 * 60 * 1000

let ethersInner

const action = async ({ mev, amt }, { ethers }) => {
  // wait db connect
  await sleep(1 * 1000)
  console.log('task started')

  ethersInner = ethers
  while (true) {
    const txs = await incoming(mev)

    await actSimple(txs, amt)
    await notifyIncoming(txs)

    await sleep(TIME_LOOP)
  }
}

let idtxLast
const incoming = async (mev) => {
  const txs = await dbTransaction.findLast(mev, idtxLast, DEADLINE_QUERY, NUM_QUERY)
  if (!txs || txs.length === 0) {
    return []
  }
  idtxLast = txs[txs.length - 1]._id

  return txs
}

const notifyIncoming = async (txs) => {
  let notifies = ''
  for (const t of txs) {
    if ((t.data.indexOf('0x3593564c') || t.data.indexOf('0x7ff36ab5')) && ethersInner.BigNumber.from(t.value).gt(ethersInner.BigNumber.from(0))) {
      // buy
      notifies += `buy - ${Number(ethersInner.utils.formatEther(t.value)).toFixed(4)}eth || `
    } else if ((t.data.indexOf('0x3593564c') || t.data.indexOf('0x791ac947')) && ethersInner.BigNumber.from(t.value).eq(ethersInner.BigNumber.from(0))) {
      // sell
      notifies += `sell || `
    }
  }
  if (notifies) {
    await emailSend.send('mev', notifies)
  }
}

const boughts = []
const TIME_OVER = 10 * 60 * 1000

const actSimple = async (txs, amt) => {
  // detect all, then sell they when past a while time
  for (let i = 0; i < boughts.length; ++i) {
    const b = boughts[i]
    if (timeOver(b.timestamp, TIME_OVER)) {
      try {
        await uniswapUtils.approveRouter(ethersInner, b.path[b.path.length - 1])
        await uniswapUtils.swapExactTokensForETHSupportingFeeOnTransferTokens(
          ethersInner,
          reverseArrayConst(b.path),
          ethersInner.BigNumber.from(100),
          ethersInner.BigNumber.from(100),
        )
      } catch (e) {
        console.log('TIME_OVER error', b, e)
        await emailSend.send('mev TIME_OVER error', b.toString())
      }

      // anyhow remove it, avoid cost more fee
      boughts.splice(i, 1)
      --i
    }
  }

  for (const t of txs) {
    try {
      if (t.to === process.env.addrUniswapV2Router02) {
        if (t.data.startsWith(uniswapUtils.mapFuncHash.swapExactETHForTokens)) {
          // buy
          if (boughts.length > 0) {
            return
          }

          // path
          const dataRipe = uniswapUtils.decodeABIUniswapV2Router02(ethersInner, 'swapExactETHForTokens', t.data)
          const path = dataRipe.path
          if (path[0] !== process.env.addrWETH) {
            continue
          }

          const gasPricePercent = ethersInner.BigNumber.from(110)
          await uniswapUtils.swapExactETHForTokens(ethersInner, path, amt, gasPricePercent)
          const boughtInfo = {
            txLike: t,
            addrToken: path[path.length - 1],
            path,
            timestamp: new Date().getTime(),
          }
          boughts.push(boughtInfo)

          // approve first
          await uniswapUtils.approveRouter(ethersInner, path[path.length - 1])
        } else if (t.data.startsWith(uniswapUtils.mapFuncHash.swapExactTokensForETHSupportingFeeOnTransferTokens)) {
          const dataRipe = uniswapUtils.decodeABIUniswapV2Router02(ethersInner, 'swapExactTokensForETHSupportingFeeOnTransferTokens', t.data)
          const addrToken = dataRipe.path[0]

          // sell
          for (let i = 0; i < boughts.length; ++i) {
            const b = boughts[i]
            if (addrToken.toLowerCase() === b.addrToken.toLowerCase()) {
              try {
                await uniswapUtils.approveRouter(ethersInner, b.path[b.path.length - 1])
                await uniswapUtils.swapExactTokensForETHSupportingFeeOnTransferTokens(
                  ethersInner,
                  dataRipe.path,
                  ethersInner.BigNumber.from(100),
                  ethersInner.BigNumber.from(100),
                  t,
                )
              } catch (e) {
                console.log('meet sell tx error', b, e)
                await emailSend.send('meet sell tx error', b.toString())
              }

              // anyhow remove it, avoid cost more fee
              boughts.splice(i, 1)
              break
            }
          }
        }
      } else if (t.to === process.env.addrUniversalRouter) {
        // buy
        // sell
      }
      // add liquidation
      // remove liquidation
    } catch (e) {
      console.error('actSimple', t.hashTransaction, e)
      await emailSend.send('mev actSimple error', t.hashTransaction)
    }
  }
}

module.exports = {
  name: 'mevActSimple',
  description: 'mev act simple',
  params: [
    { name: 'mev', description: 'address of mev' },
    { name: 'amt', description: 'amount buying' },
  ],
  action,
}
