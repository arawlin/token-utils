const sleep = async (interval) => {
  return new Promise((resolve) => setTimeout(resolve, interval))
}
const timeIntervalSec = (interval) => {
  return parseInt(new Date().getTime() / 1000 + interval)
}

const timeOver = (last, over) => {
  return new Date().getTime() - last > over
}

const timeNow = () => {
  return new Date().toISOString()
}

const timeThen = (timestamp) => {
  return new Date(timestamp).toISOString()
}

module.exports = {
  sleep,
  timeIntervalSec,
  timeOver,
  timeNow,
  timeThen,
}
