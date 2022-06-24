const db = require('./index')

/*
transaction - {
    "_id": {
        "$oid": "62b574f5838caa09ab321a71"
    },
    "address": "xxxxx",
    "blockHash": "xxxx",
    "blockNumber": xxxx,
    "data": "xxxxx",
    "id": "xxxx",
    "logIndex": xxxx,
    "removed": false,
    "topics": ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef", "xxxx", "xxxx"],
    "transactionHash": "xxxx",
    "transactionIndex": xx
}
*/
const nmColl = 'transaction'

const find = async (fitler, options) => {
  return await db.find(nmColl, fitler, options)
}

const count = async (filter) => {
  return await db.countDocuments(nmColl, filter)
}

const update = async (filter, m) => {
  await db.updateOne(nmColl, filter, m)
}

module.exports = {
  find,
  count,
  update,
}
