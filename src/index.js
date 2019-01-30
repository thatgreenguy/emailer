const config = require('./lib/config')
const CONST = require('./lib/const')
const moment = require('moment')
const database = require('./lib/database')
const compose = require('./lib/compose')
const log = require('./lib/log')
const mailer = require('./lib/mailer')

const PROCESSED = CONST.JDE.MAIL_CONFIG.PROCESSED
const PROCESS_ERROR = CONST.JDE.MAIL_CONFIG.PROCESS_ERROR

let check = 0

async function checkQueue() {

  let checkTiming = moment()
  let result
  let queued

  result = await database.checkQueue()
  queued = result.result.rows  
  if ( queued.length ) processQueue( queued )  

  log.verbose(`Emailer Queue check complete, found ${queued.length}`)  

}

async function processQueue( queued ) {

  for ( const queuedMail of queued ) {

    let id = queuedMail[0]
    let template = queuedMail[3]
    let recipient = queuedMail[4]
    let language = queuedMail[5]
    let result  
    let email 
    let status 
    let sendResponse
    let processed

    try {

    log.info( `Start processing queued mail item: ${id} to ${recipient} using template: ${template} in language: ${language}`)
  
    result = await compose.email( id, template, recipient, language )

    status = result.status
    email = result.email

    // If email valid then attempt send 
    if ( status.valid ) {

        sendResponse = await mailer.send( email )
        processed = PROCESSED

    } else {

        sendResponse = status.message
        processed = PROCESS_ERROR

    }

    await database.updateQueue( id, processed, sendResponse )

    log.info( `Finished processing queued mail item: ${id} to ${recipient} using template: ${template} in language: ${language} - Result:: ${sendResponse}`)

    } catch(err) {

      log.error(`Queued mail processing for item: ${id} failed with details: ${err}`)

    } finally {

      // noop

    }
  }  
}

log.info(`                                                                       `)
log.info(`EMAILER - now active and monitoring the JDE email queue every ${config.app.pollingInterval / 1000} seconds`)
log.info(`                                                                       `)

checkQueue()

setInterval(checkQueue, config.app.pollingInterval)
