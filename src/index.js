const config = require('./lib/config')
const CONST = require('./lib/const')
const moment = require('moment')
const database = require('./lib/database')
const compose = require('./lib/compose')
const log = require('./lib/log')
const mailer = require('./lib/mailer')

const PROCESSED = CONST.JDE.MAIL_CONFIG.PROCESSED
const PROCESS_ERROR = CONST.JDE.MAIL_CONFIG.PROCESS_ERROR

let processStatus = 0

let check = 0

async function checkQueue() {

  let checkTiming = moment()
  let result
  let queued

  // If already processing no need to spawn another check just yet wait for next poll period
  if ( processStatus == 0 ) {

    processStatus = 1

    result = await database.checkQueue()
    queued = result.result.rows  
    
    if ( queued.length ) await processQueue( queued )  

    log.info(`Emailer Queue check complete, found ${queued.length}`)  
    processStatus = 0

  } else {
  
    log.warn(`Emailer Queue check skipped as previous one still in progress. Will try again at next Poll interval.`)  

  }
}

async function processQueue( queued ) {

  for ( const queuedMail of queued ) {

    let id = queuedMail[0]
    let template = queuedMail[3]
    let recipient = queuedMail[4]
    let language = typeof queuedMail[5] !== undefined ? queuedMail[5] : ' '
    let result  
    let email 
    let status 
    let sendResponse
    let processed = PROCESS_ERROR

    try {

      log.info( `Start processing queued mail item: ${id} to ${recipient} using template: ${template} in language: ${language}`)

      result = await database.updateQueueSending( id, template, recipient, language )
      result = await compose.email( id, template, recipient, language )

      log.verbose( `Composed email : ${JSON.stringify(result, null, '\t')}`)

      email = result.email
      status = result.status

      // If email composed without errors then attempt send 
      if ( status.valid ) {

        sendResponse = await mailer.send( email )
        processed = PROCESSED

      } else {
        sendResponse = status.message
      }

    } catch(err) {

      // If we catch an unexpected program error then mark the email as in error and feedback error text

      sendResponse = err
      log.error(`Queued mail processing for item: ${id} failed : ${err}`)

    } finally {

      // Error or not last action is to update the Email queue item as Processed or Errored

      await database.updateQueue( id, processed, sendResponse, template )
      log.info( `Finished processing queued mail item: ${id} to ${recipient} using template: ${template} in language: ${language} - Result:: ${sendResponse}`)

    }
  }  
}

log.info(`                                                                       `)
log.info(`EMAILER - now active and monitoring the JDE email queue every ${config.app.pollingInterval / 1000} seconds`)
log.info(`                                                                       `)

checkQueue()

setInterval(checkQueue, config.app.pollingInterval)
