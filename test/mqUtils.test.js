const Pulsar = require('pulsar-client')

describe('mq test', () => {
  let client

  before(async () => {
    client = new Pulsar.Client({
      serviceUrl: process.env.uriMQ,
    })
  })

  after(async () => {
    await client.close()
  })

  it('pulsar test producer', async () => {
    const producer = await client.createProducer({
      topic: 'my-topic', // or 'my-tenant/my-namespace/my-topic' to specify topic's tenant and namespace
    })

    await producer.send({
      data: Buffer.from('Hello, Pulsar'),
    })

    for (let i = 0; i < 10; i += 1) {
      const msg = `my-message-${i}`
      producer.send({
        data: Buffer.from(msg),
      })
      console.log(`Sent message: ${msg}`)
    }
    await producer.flush()

    await producer.close()
  })

  it.skip('pulsar test consumer', async () => {
    const consumer = await client.subscribe({
      topic: 'my-topic',
      subscription: 'my-subscription',
    })

    while (true) {
      const msg = await consumer.receive()
      console.log(msg, msg?.getData())
      if (!msg || !msg?.getData()) {
        break
      }
      console.log(msg.getData().toString())
      consumer.acknowledge(msg)
    }

    await consumer.close()
  })
})
