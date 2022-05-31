const config = require('./config')
const log = require('./log')
const nodemailer = require('nodemailer')

const transport = nodemailer.createTransport({
  host: config.mail.host,
  port: config.mail.port,
  secure: config.mail.security,
  auth: {
      user: config.mail.user,
      pass: config.mail.password
  }
})

const mailer = {}

mailer.send = function (email) {

  return new Promise( async function( resolve, reject ) {

    let sendResponse
    let result

    try {

      // It is possible to override email recipient to a developer or tester email account 
      // if that option is inplay also clear out cc and bcc fields to email only goes to designated recipient
      if ( config.app.overrideAllRecipientsTo !== ''  ) {

        log.warn(`Recipients override is in place - see config DEV or TEST_OVERRIDE_ALL_RECIPIENTS_TO setting. As a result emails will only be sent to: ${config.app.overrideAllRecipientsTo}`)
	email.to = config.app.overrideAllRecipientsTo
        email.cc = ''
        email.bcc = ''
      }
		// throw new Error('Error before mail send');

      sendResponse = await transport.sendMail(email)

      // The message ID is the main thing we wantt to capture and store as success message
      // after that append the rest of the gmail response string space permitting

      result = sendResponse.messageId + ' ' + sendResponse.response.substring(0, 99 - sendResponse.messageId.length)

      log.verbose(`Send mail OK: ${result}`)
      log.verbose(`Send mail OK: ${JSON.stringify(sendResponse, null, '\t')}`)

      resolve(result)

    } catch ( err )  {

      log.debug(`Send mail Failed: ${JSON.stringify(err, null, '\t')}`)

      reject(err)

    } finally {
 
      // noop

    }

  })
}

module.exports = mailer
