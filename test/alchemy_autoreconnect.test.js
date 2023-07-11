const WebSocket = require('../libs/websocket')
const logger = require('../libs/logger').init('test_alchemy')

const main = async () => {
  let count = 0
  const ws = new WebSocket('wss://eth-mainnet.g.alchemy.com/v2/sVc2L6C56xOcxR5GE0tmN9IhpXmB7DdC', { retryInterval: 10000 }, (event) => {
    logger.info('msg', ++count, event.data)
  })

  ws.on('open', () => {
    logger.warn('open')
    ws.send(
      `{"jsonrpc":"2.0","id": 2, "method": "eth_subscribe", "params": ["alchemy_pendingTransactions", {"toAddress": ["0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"], "hashesOnly": false}]}`,
    )
  })
}

main().then(console.log('finish'))
