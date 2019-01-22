const config = require('./config')
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

    try {

      sendResponse = await transport.sendMail(email)

      resolve(sendResponse)

    } catch ( err )  {
      reject(err)

    } finally {
 
      // noop

    }

  })
}

module.exports = mailer
