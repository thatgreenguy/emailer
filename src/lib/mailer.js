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

      // Pluck the most useful information from the response to return as success message
      // consisting of response + messagId

      log.debug(`Send mail OK: ${JSON.stringify(sendResponse, null, '\t')}`)
      result = sendResponse.response + sendResponse.messageId

      resolve(result)

    } catch ( err )  {
      log.debug(`Send mail ERROR: ${JSON.stringify(err, null, '\t')}`)
      reject(err)

    } finally {
 
      // noop

    }

  })
}

module.exports = mailer
