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

  log.debug(`Check ${check++} complete, found ${queued.length}`)  

}

async function processQueue( queued ) {

  for ( const queuedMail of queued ) {

    let id = queuedMail[0]
    let template = queuedMail[3]
    let recipient = queuedMail[4]
    let language = queuedMail[5]
    let email 
    let sendResponse

    log.info( `Processing queued mail item: ${id} to ${recipient} using template: ${template} in language: ${language}`)
  
    email = await compose.email( id, template, recipient, language )

    log.verbose( `Sending email : ${JSON.stringify(email, null, '\t')}`)

    sendResponse = await mailer.send( email )

    log.debug(`Send Results: ${JSON.stringify(sendResponse, null, '\t')}`)

    processedFlag = PROCESS_ERROR
    processedFlag = PROCESSED

    await database.updateQueue( id, processedFlag, sendResponse )

  }  
}

log.info(`                                                                       `)
log.info(`EMAILER - now active and monitoring the JDE email queue every ${config.app.pollingInterval / 1000} seconds`)
log.info(`                                                                       `)

checkQueue()

setInterval(checkQueue, config.app.pollingInterval)
