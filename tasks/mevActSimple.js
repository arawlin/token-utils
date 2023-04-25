const { sleep } = require('../libs')
const emailSend = require('../libs/emailSend')
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

const actSimple = async (txs) => {
  // TODO: detect all, then sell they when past long time ago

  for (const t of txs) {
    if (t.to === process.env.addrUniswapV2Router02) {
      // buy
      actUniswapBuy(t)

      // sell
      // add liquidation
      // remove liquidation
    } else if (t.to === process.env.addrUniversalRouter) {
    }
  }
}

const actUniswapBuy = async (t) => {}

module.exports = {
  name: 'mevActSimple',
  description: 'mev act simple',
  params: [{ name: 'mev', description: 'address of mev' }],
  action,
}
