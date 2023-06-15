const WebSocket = require('ws')
const logger = require('../libs/logger').init('test_alchemy')

const main = async () => {
  const ws = new WebSocket('wss://eth-mainnet.g.alchemy.com/v2/sVc2L6C56xOcxR5GE0tmN9IhpXmB7DdC')

  ws.on('open', () => {
    logger.warn('open')
    ws.send(
      `{"jsonrpc":"2.0","id": 2, "method": "eth_subscribe", "params": ["alchemy_pendingTransactions", {"toAddress": ["0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"], "hashesOnly": false}]}`,
    )
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

// wscat -c wss://eth-mainnet.g.alchemy.com/v2/sVc2L6C56xOcxR5GE0tmN9IhpXmB7DdC
// {"jsonrpc":"2.0","id": 2, "method": "eth_subscribe", "params": ["alchemy_pendingTransactions", {"fromAddress": ["0xAf2358e98683265cBd3a48509123d390dDf54534", "0xb45e7fdc73a3eb492f64171464f19c100a9cd3f0"], "hashesOnly": false}]}
// {"jsonrpc":"2.0","id": 2, "method": "eth_subscribe", "params": ["alchemy_pendingTransactions", {"hashesOnly": false}]}
// {"jsonrpc":"2.0","id": 2, "method": "eth_subscribe", "params": ["alchemy_pendingTransactions", {"toAddress": ["0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"], "hashesOnly": false}]}
