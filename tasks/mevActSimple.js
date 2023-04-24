const { sleep } = require('../libs')
const emailSend = require('../libs/emailSend')
const dbTransaction = require('../db/dbTransaction')

const TIME_LOOP = 1 * 1000

const NUM_QUERY = 10
const INTERVAL_DEADLINE_QUERY = 15 * 1000

const action = async ({ mev }, { ethers }) => {
  while (true) {
    const txs = await incoming(mev, ethers)

    await actSimple(ethers, txs)
    await notifyIncoming(ethers, txs)

    await sleep(TIME_LOOP)
  }
}

let txLast
const incoming = async (mev) => {
  const txs = await dbTransaction.findLast(mev, INTERVAL_DEADLINE_QUERY, NUM_QUERY)
  if (!txs || txs.length === 0) {
    return []
  }
  txs.reverse()

  const txsFiltered = []
  for (let i = 0; i < txs.length; ++i) {
    if (txLast === txs[i].hashTransaction) {
      return
    }
    txLast = txs[i].hashTransaction

    txsFiltered.push(txs[i])
  }
  return txsFiltered
}

const notifyIncoming = async (ethers, txs) => {
  let notifies = ''
  for (const t of txs) {
    if ((t.data.indexOf('0x3593564c') || t.data.indexOf('0x7ff36ab5')) && t.value.gt(ethers.BigNumber.from(0))) {
      // buy
      notifies += `buy - ${Number(ethers.utils.formatEther(t.value)).toFixed(4)}eth || `
    } else if ((t.data.indexOf('0x3593564c') || t.data.indexOf('0x791ac947')) && t.value.eq(ethers.BigNumber.from(0))) {
      // sell
      notifies += `sell || `
    }
  }
  if (notifies) {
    await emailSend.send('mev', notifies)
  }
}

const actSimple = async (ethers, txs) => {
  // detect all, then sell they when past long time ago
}

module.exports = {
  name: 'mevActSimple',
  description: 'mev act simple',
  params: [{ name: 'mev', description: 'address of mev', defaultValue: '' }],
  action,
}
