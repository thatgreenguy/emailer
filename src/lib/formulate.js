const CONST = require('./const')
const config = require('./config')
const log = require('./log')
const database = require('./database')

const formulate = {}

formulate.prepareEmail = function(template, recipient, language) {

  return new Promise(async function(resolve, reject) {

    let email = {}
    let emailConfiguration

    try {

      emailConfiguration = await database.readEmailConfiguration( 
        CONST.JDE.MAIL_CONFIG.DEFAULT_VERSION, template )

      log.debug(`email config is: ${JSON.stringify(emailConfiguration)}`)

      resolve( emailConfiguration )

    } catch( err ) {
      reject( err )

    } finally {

      // Noop

    }
  })

}


module.exports = formulate



