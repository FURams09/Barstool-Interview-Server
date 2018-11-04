module.exports = {
  log: errMsg => {
    console.log(errMsg)
    return { error: errMsg }
  }
}
