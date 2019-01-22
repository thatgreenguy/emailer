const CONST = require('./const')
const config = require('./config')
const log = require('./log')
const database = require('./database')

const formulate = {}

/**
 * formulate an email from email configuration data interpolated with any token values
 *
 * Return an email object acceptable to nodemailer stuctured as per example below: 
 *
 *     email.from = 'sender@example.com'
 *     email.to = 'recipient1@example.com, recipient2@example.com'
 *     email.cc = 'cc1@example.com'
 *     email.bcc = 'bcc1@example.com'
 *     email.subject = 'Example subject line'
 *     email.body = 'Thie is where the example body text should go...'
 *
 * Tokens are just key value pairs which are regex replaced in email subject and body text
 *
 * Note: Email configuration is sensitive to language code and template name and will be retireved 
 *       according to following rules/priority
 * 
 * Highest Priority : Template Name and Language Code
 * Next Highest     : Template Name 
 * Next Highest     : Default *ALL and Language Code
 * Lowest Priority  : Default *ALL
 *
 * All emails will have the same sender i.e. noreply@dlink.com so the configuration for this need 
 * only exist at the lowest level
 * 
 * A default catch all email subject line can be added at the Lowest Priority and also for the French language a 
 * So 1 entry at Default *ALL and another at *ALL plus 'F'. 
 * When the emailer runs with a German language code the Default *ALL Subject configuration entry will be used
 * When run for a French language code then French specific configuration will be picked up 
 * (overrides the Default *ALL entry)
 *
 * This same override concept works at each successive level from lowest to highest.
 *
 */

formulate.prepareEmail = function(id, template, recipient, language) {

  return new Promise(async function(resolve, reject) {

    let email = {}
    let dbResult
    let emailConfiguration
    let emailTokens

    function _tokenised(emailTokens) {

      let tokenised = []

      emailTokens = emailTokens.result.rows
      tokenised = emailTokens.map( function(entry, index) {

        let result = {}
        let tokenName = entry[3].trim()
        let tokenValue = entry[4]
        result[tokenName] = tokenValue

        return result
      })
      
      log.debug(`email tokens :: ${JSON.stringify(tokenised)}`)

      return tokenised

    }

    function _prioritised(emailConfiguration) {

      emailConfiguration = emailConfiguration.result.rows

      log.debug(`email config :: ${JSON.stringify(emailConfiguration)}`)

      return emailConfiguration

    }

    try {

      dbResult = await database.readEmailConfiguration( CONST.JDE.MAIL_CONFIG.DEFAULT_VERSION, template )
      emailConfiguration = _prioritised(dbResult)

      dbResult = await database.readEmailTokens( id )
      emailTokens = _tokenised(dbResult) 

      email.from = 'sender@example.com'
      email.to = 'recipient1@example.com, recipient2@example.com'
      email.cc = 'cc1@example.com'
      email.bcc = 'bcc1@example.com'
      email.subject = 'Example subject line'
      email.body = 'Thie is where the example body text should go...'

      resolve( email )

    } catch( err ) {
      reject( err )

    } finally {

      // Noop

    }
  })

}


module.exports = formulate



