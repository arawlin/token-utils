const sleep = async (interval) => {
  return new Promise((resolve) => setTimeout(resolve, interval))
}
const timeInterval = (interval) => {
  return parseInt(new Date().getTime() / 1000 + interval)
}

const timeNow = () => {
  return new Date().toISOString()
}

const timeThen = (timestamp) => {
  return new Date(timestamp).toISOString()
}

module.exports = {
  sleep,
  timeInterval,
  timeNow,
  timeThen,
}
