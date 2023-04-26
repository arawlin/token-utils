const { sleep, timeOver, timeNow } = require('../libs')
const emailSend = require('../libs/emailSend')
const uniswapUtils = require('../libs/uniswapUtils')
const dbTransaction = require('../db/dbTransaction')

const TIME_LOOP = 1 * 1000

const NUM_QUERY = 10
const DEADLINE_QUERY = 15 * 1000

let ethersInner

const action = async ({ mev }, { ethers }) => {
  // wait db connect
  await sleep(1 * 1000)
  console.log('task started')

  ethersInner = ethers
  while (true) {
    const txs = await incoming(mev)

    await actSimple(txs)
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
    if ((t.data.indexOf('0x3593564c') || t.data.indexOf('0x7ff36ab5')) && t.value.gt(ethersInner.BigNumber.from(0))) {
      // buy
      notifies += `buy - ${Number(ethersInner.utils.formatEther(t.value)).toFixed(4)}eth || `
    } else if ((t.data.indexOf('0x3593564c') || t.data.indexOf('0x791ac947')) && t.value.eq(ethersInner.BigNumber.from(0))) {
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

const actSimple = async (txs) => {
  // TODO: detect all, then sell they when past a while time
  for (let i = 0; i < boughts.length; ++i) {
    const b = boughts[i]
    if (timeOver(b.timestamp, TIME_OVER)) {
      await uniswapUtils.swapExactTokensForETHSupportingFeeOnTransferTokens(
        ethersInner,
        b.path.reverse(),
        ethersInner.utils.BigNumber.from(100),
        ethersInner.utils.BigNumber.from(100),
      )
      boughts.splice(i, 1)
      --i
    }
  }

  for (const t of txs) {
    try {
      if (t.to === process.env.addrUniswapV2Router02) {
        if (t.data.startWith(uniswapUtils.mapFuncHash('swapExactETHForTokens'))) {
          // buy
          if (boughts.length > 0) {
            return
          }

          // path
          const dataRipe = uniswapUtils.decodeABIUniswapV2Router02(ethersInner, 'swapExactETHForTokens', t.data)
          if (dataRipe.path[0] !== process.env.addrWETH) {
            continue
          }

          const boughtInfo = await uniswapUtils.swapExactETHForTokens(ethersInner, dataRipe.path, '0.05', ethersInner.utils.BigNumber.from(110))
          boughtInfo.timestamp = new Date().getTime()
          boughtInfo.path = dataRipe.path
          boughts.push(boughtInfo)
        } else if (t.data.startWith(uniswapUtils.mapFuncHash('swapExactTokensForETHSupportingFeeOnTransferTokens'))) {
          // sell
        }
      } else if (t.to === process.env.addrUniversalRouter) {
        // buy
        // sell
      }
      // add liquidation
      // remove liquidation
    } catch (e) {
      console.error('actSimple', t.hashTransaction, e)
      await emailSend.send('mev actSimple error', timeNow(), t.hashTransaction)
    }
  }
}

module.exports = {
  name: 'mevActSimple',
  description: 'mev act simple',
  params: [{ name: 'mev', description: 'address of mev' }],
  action,
}
