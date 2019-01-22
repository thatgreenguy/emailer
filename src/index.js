const config = require('./lib/config')
const moment = require('moment')
const database = require('./lib/database')
const formulate = require('./lib/formulate')
const log = require('./lib/log')

let check = 0

async function checkQueue() {

  let checkTiming = moment()
  let result
  let queued

  result = await database.checkQueue()
  queued = result.result.rows  
  if ( queued.length ) processQueue( queued )  

  log.debug(`Check ${check++} complete, found ${queued.length}`)  

}

async function processQueue( queued ) {

  for ( const queuedMail of queued ) {

    let id = queuedMail[0]
    let template = queuedMail[3]
    let recipient = queuedMail[4]
    let language = queuedMail[5]
    let email 
  
    email = await formulate.prepareEmail( id, template, recipient, language )

    log.info( `Process queued mail item: ${id} to ${recipient} using template: ${template} in language: ${language}`)
    log.verbose( `Email: ${JSON.stringify(email)} `)

  }
  
}

log.info(`Start Monitoring Email Queue every ${config.app.pollingInterval / 1000} seconds`)
checkQueue()
setInterval(checkQueue, config.app.pollingInterval)
