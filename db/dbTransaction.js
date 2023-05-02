const db = require('./index')

/*
transaction -
{
  "_id": { "$oid": "644a203a4f68584bac595fd4" },
  "hashTransaction": "0x",
  "blockNumber": 17135954,
  "data": "0x",
  "gasFee": "0.00371764495607612",
  "gasPrice": "32937405476",
  "gasPriceWrap": "32.937405476",
  "gasLimit": "222222",
  "gasUsed": "112870",
  "status": 1,
  "timestamp": 1682579507,
  "timestampWrap": "2023-04-27T07:11:47.000Z",
  "from": "0xaaaaa",
  "to": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  "value": "0",
  "valueWrap": "0.0"
}
*/
const nmColl = 'transaction'
const constructColl = (addr) => nmColl + '-' + addr.toLowerCase()

const countContract = async (addrFrom, addrContract) => {
  return await db.countDocuments(constructColl(addrFrom), { to: addrContract })
}

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
  countContract,
  findByHashTransaction,
  findLast,
  save,
  saveAll,
}
