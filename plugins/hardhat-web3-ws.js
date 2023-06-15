const { extendEnvironment } = require('hardhat/config')
const { lazyFunction, lazyObject } = require('hardhat/plugins')
const Web3WsProvider = require('web3-providers-ws')

/**
 * adapt env.network.config.url from 'https://' to 'wss://'
 *
 * HardHat only suppot http protocol
 *
 * @param {*} httpURL
 * @returns
 */
const adaptNetwork = (httpURL) => {
  if (httpURL.startsWith('https')) {
    return httpURL.replace('https', 'wss')
  } else if (httpURL.startsWith('http')) {
    return httpURL.replace('http', 'ws')
  }
}

extendEnvironment((env) => {
  if (!env.network.config.urlws) {
    console.log('urlws not config')
    return
  }
  env.Web3 = lazyFunction(() => require('web3'))
  env.web3 = lazyObject(() => {
    const Web3 = require('web3')
    const options = {
      timeout: 5000, // ms

      clientConfig: {
        // Useful if requests are large
        maxReceivedFrameSize: 100000000, // bytes - default: 1MiB
        maxReceivedMessageSize: 100000000, // bytes - default: 8MiB

        // Useful to keep a connection alive
        keepalive: true,
        keepaliveInterval: 10000, // ms
      },

      // Enable auto reconnection
      reconnect: {
        auto: true,
        delay: 5000, // ms
        maxAttempts: false,
        onTimeout: false,
      },
    }
    const provider = new Web3WsProvider(env.network.config.urlws, options)
      .on('connect', () => console.log('Web3WsProvider - connect'))
      .on('reconnect', () => console.log('Web3WsProvider - reconnect'))
    const web3 = new Web3(provider)

    web3.eth.extend({
      property: 'txpool',
      methods: [
        {
          name: 'content',
          call: 'txpool_content',
        },
        {
          name: 'inspect',
          call: 'txpool_inspect',
        },
        {
          name: 'status',
          call: 'txpool_status',
        },
        {
          name: 'contentFrom',
          call: 'txpool_contentFrom',
          params: 1,
          inputFormatter: [web3.extend.formatters.inputAddressFormatter],
        },
      ],
    })
    return web3
  })
})
