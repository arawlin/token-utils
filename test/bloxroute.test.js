const WebSocket = require('ws')
const logger = require('../libs/logger').init('test_bloxroute')

const main = async () => {
  const ws = new WebSocket('wss://api.blxrbdn.com/ws', {
    headers: { Authorization: 'ZDI1ZjY3YzUtNzYwMi00MTljLWEwNWMtYTg5OTY2YTc2NTBjOjM5MjI3MmEwY2Q2ZTM0NTM0YTEzYzQ1N2Y1MThhZGUz' },
  })

  ws.on('open', () => {
    logger.warn('open')
    ws.send(`{"jsonrpc": "2.0", "id": 1, "method": "subscribe", "params": ["newTxs", {"include": ["tx_hash"]}]}`)
  })

  let count = 0
  ws.on('message', (msg) => {
    logger.info('msg', ++count, msg.toString())
  })

  ws.on('close', () => {
    logger.warn('close')
  })

  ws.on('error', (e) => {
    logger.error('error', e)
  })

  ws.on('ping', (d) => {
    logger.warn('ping', d.toString())
  })

  ws.on('pong', (d) => {
    logger.warn('pong', d.toString())
  })
}

main().then(console.log('finish'))

// wscat -H 'Authorization:ZDI1ZjY3YzUtNzYwMi00MTljLWEwNWMtYTg5OTY2YTc2NTBjOjM5MjI3MmEwY2Q2ZTM0NTM0YTEzYzQ1N2Y1MThhZGUz' -c wss://api.blxrbdn.com/ws
// {"jsonrpc": "2.0", "id": 1, "method": "subscribe", "params": ["newTxs", {"include": ["tx_hash"], "filters": "from in [0xAf2358e98683265cBd3a48509123d390dDf54534, 0xb45e7fdc73a3eb492f64171464f19c100a9cd3f0]"}]}
// {"jsonrpc": "2.0", "id": 1, "method": "subscribe", "params": ["newTxs", {"include": ["tx_hash"]}]}
