const config = require('./config')
const log = require('./log')
const nodemailer = require('nodemailer')

const transport = nodemailer.createTransport({
  host: config.mail.host,
  port: config.mail.port,
  secure: true,
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
