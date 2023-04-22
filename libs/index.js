const sleep = async (interval) => {
  return new Promise((resolve) => setTimeout(resolve, interval))
}
const timeInterval = (interval) => {
  return parseInt(new Date().getTime() / 1000 + interval)
}

module.exports = {
  sleep,
  timeInterval,
}
