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

const findLast = async (addr, idLast, deadline, num) => {
  const options = { timestamp: { $gt: (new Date().getTime() - deadline) / 1000 } }
  if (idLast) {
    options._id = { $gt: idLast }
  }
  return await db.find(constructColl(addr), options, { limit: num })
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
