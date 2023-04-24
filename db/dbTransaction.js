const db = require('./index')

/*
transaction - {
    "_id": {
        "$oid": "62b574f5838caa09ab321a71"
    },
}
*/
const nmColl = 'transaction'
const constructColl = (addr) => nmColl + '-' + addr.toLowerCase()

const findByHashTransaction = async (addr, hashTransaction) => {
  return await db.findOne(constructColl(addr), { hashTransaction })
}

const findLast = async (addr, interval, num) => {
  const deadline = (new Date().getTime() - interval) / 1000
  return await db.find(constructColl(addr), { timestamp: { $gt: deadline } }, { sort: { _id: -1 }, limit: num })
}

const save = async (addr, tx) => {
  await db.updateOne(constructColl(addr), { hashTransaction: tx.hashTransaction }, tx)
}

const saveAll = async (addr, txs) => {
  const opers = []
  for (const t of txs) {
    const o = {
      updateOne: {
        filter: { hashTransaction: t.hashTransaction },
        update: { $set: t },
        upsert: true,
      },
    }
    opers.push(o)
  }
  return await db.bulkWrite(constructColl(addr), opers)
}

module.exports = {
  findByHashTransaction,
  findLast,
  save,
  saveAll,
}
