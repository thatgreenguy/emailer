const config = require('./lib/config')
const database = require('./lib/database')

let check = 0

function checkQueue() {

  database.checkQueue()  
  console.log('Performing check: ', check++)  

}

console.log('Start Monitoring Email Queue: Check every ', config.app.pollingInterval)
checkQueue()
setInterval(checkQueue, config.app.pollingInterval)
