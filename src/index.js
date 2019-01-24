const config = require('./lib/config')
const moment = require('moment')
const database = require('./lib/database')
const compose = require('./lib/compose')
const log = require('./lib/log')
const mailer = require('./lib/mailer')

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

    log.info( `Processing queued mail item: ${id} to ${recipient} using template: ${template} in language: ${language}`)
  
    email = await compose.email( id, template, recipient, language )
    log.verbose( `Email: ${JSON.stringify(email)} `)

//    Dont send email yet
//    sendResult = await mailer.send( email )

    await database.updateQueue( id, 'Y', 'OK' )

// One at a time while testing
break


  }  
}

log.info(`Start Monitoring Email Queue every ${config.app.pollingInterval / 1000} seconds`)
checkQueue()
setInterval(checkQueue, config.app.pollingInterval)
