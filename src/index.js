const config = require('./lib/config')
const CONST = require('./lib/const')
const moment = require('moment')
const database = require('./lib/database')
const compose = require('./lib/compose')
const log = require('./lib/log')
const mailer = require('./lib/mailer')
const attachments = require('./lib/attachments')
const emailTemplate = require('./lib/emailTemplate')

const PROCESSED = CONST.JDE.MAIL_CONFIG.PROCESSED
const PROCESS_ERROR = CONST.JDE.MAIL_CONFIG.PROCESS_ERROR

const DEFAULT_TEMPLATE = 'DEFAULT E ';

const RETRY_LIMIT = config.app.retryLimit;
const RETRY_PREVIOUS_DAYS = config.app.retryPreviousDays;

let processStatus = 0

let check = 0

async function markEmailDone( id, processed, sendResponse, actualTemplate, template, errorCount, recipient, language ) {

  // Error or not last action is to update the Email queue item as Processed or Errored and log error in F56CM33
  try {
      await database.logEmailResponse( id, processed, sendResponse, actualTemplate, errorCount);
  } catch( err ) {
      processed = PROCESS_ERROR
      sendResponse = err
      log.error(`Queued mail processing for item: ${id} failed updating log file : ${err}`)
      
  } finally{
      errorCount++;
      await database.updateQueue( id, processed, sendResponse, template, errorCount )
      log.info( `Finished processing queued mail item: ${id} to ${recipient} using template: ${template} in language: ${language} - Result:: ${sendResponse}`)
  }
}

async function retryQueue() {

  let result
  let retryCount

  result = await database.retryErrors( RETRY_LIMIT, RETRY_PREVIOUS_DAYS )
  retryCount = result.result.rowsAffected;
  log.info(`Emailer Retry check complete, found ${retryCount}.`)
}

async function checkQueue() {

  let checkTiming = moment()
  let result
  let queued

  try {

    // If already processing no need to spawn another check just yet wait for next poll period
    if ( processStatus == 0 ) {

      processStatus = 1

      result = await database.checkQueue()
      queued = result.result.rows  
    
      if ( queued.length ) await processQueue( queued )  

      log.info(`Emailer Queue check complete, found ${queued.length}.`)  

    } else {
      log.warn(`Emailer Queue check skipped as previous one still in progress. Will try again at next Poll interval.`)  
    }

  } catch(err) {
    log.error(`checkQueue Error: ${err}`)
  } finally {
    processStatus = 0
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
    let emailTemplateText = '';
    let actualTemplate;
    let newstyleTemplate = true;

    let errorCount = queuedMail[17]

    try {

      log.info( `Start processing queued mail item: ${id} to ${recipient} using template: ${template} in language: ${language}`)

      result = await database.updateQueueSending( id, template, recipient, language )

      // Skip Attachment Template check/fetch if NBDS for now. Do not want New Default Template for NBDS yet
      if ( template == 'NBDSGA    ' || template == 'NBDSCA    ' || template == 'NBDSCH    ' || template == 'NBDSRN    ' ) {
        newstyleTemplate = false;
      } else {
        newstyleTemplate = true;
      }

      if ( newstyleTemplate ) {      
        let et = await emailTemplate.get( template, language );  
        emailTemplateText = et.text;
        actualTemplate = et.actualTemplate;                        // Will be template or Default template name
      } else {
        actualTemplate = template;
      }

      // DEFAULT E template name is used for any template not found. When dealing with DEFAULT E set language to E
      if ( actualTemplate === DEFAULT_TEMPLATE ) language = 'E'          // If Default Template in play force language to 'E' 

      //     result = await compose.email( id, template, recipient, language, emailTemplateText )
      result = await compose.email( id, actualTemplate, recipient, language, emailTemplateText )

      log.verbose( `Composed email : ${JSON.stringify(result, null, '\t')}`)

      email = result.email
      status = result.status
      tokens = result.tokens

      // If email composed without errors then attempt send 
      if ( status.valid ) {

        // Fetch attachments such as Labels if required
        if ( email.attachlabel === 'DPD' || email.attachlabel === 'UPS' ) {
	  let response = await attachments.fetch( template, email, tokens );

	console.log('ATTACH response is : ', response)

          email.attachments = response.attachments;
	}	

        // Send the email
        sendResponse = await mailer.send( email )

        // After an Attachment is generated and sent then remove it from local storage
        if ( email.attachlabel === 'DPD' || email.attachlabel === 'UPS' ) {
          await attachments.remove( email.attachments );
	}

        processed = PROCESSED

      } else {
        sendResponse = status.message
      }

    } catch(err) {

      // If we catch an unexpected program error then mark the email as in error and feedback error text
      processed = PROCESS_ERROR
      sendResponse = err
      log.error(`Queued mail processing for item: ${id} failed : ${err}`)

    } finally {
      await markEmailDone( id, processed, sendResponse, actualTemplate, template, errorCount, recipient, language );
    }
  }  
}

log.info(`                                                                       `)
log.info(`EMAILER - now active and monitoring the JDE email queue every ${config.app.pollingInterval / 1000} seconds`)
log.info(`                                                                       `)

checkQueue()

setInterval(retryQueue, config.app.pollingIntervalRetry)
setInterval(checkQueue, config.app.pollingInterval)
