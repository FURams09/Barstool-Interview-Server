
/**
* Add any custom logging functionality here. 
* for simplicity I used this to log any handled 
* exception and then return a standard error object
* as opposed to just returning false or throwing to an
* error boundary
*
*/
module.exports = {
  log: errMsg => {
    console.log(errMsg)
    return { error: errMsg }
  }
}
