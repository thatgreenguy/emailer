const CONST = require('./const')
const config = require('./config')
const log = require('./log')
const database = require('./database')

const compose = {}

/**
 * Compose an email from email configuration data interpolated with any token values
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

compose.email = function(id, template, recipient, language) {

  language = language.trim()
  template = template.trim()

  return new Promise(async function(resolve, reject) {

    let dbResult
    let emailConfiguration
    let emailTokens
    let email


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
      
      log.debug(`Tokens :: ${JSON.stringify(tokenised)}`)

      return tokenised

    }

    function _prioritised(emailConfiguration) {

      function _priorityFilter( constituentConfig, priority ) {
 
       return constituentConfig.filter( function( el, i) { 
 
          let test
          let elLanguage = el[3]
          let elTemplate = el[1]

          elLanguage = elLanguage.trim()
          elTemplate = elTemplate.trim()

          switch ( priority ) {
            case 1:
              test = ( elLanguage == language && elTemplate == template   )         
              break
            case 2:
              test = ( elTemplate == template   )         
              break
            case 3:
              test = ( elLanguage == language && elTemplate == CONST.JDE.MAIL_CONFIG.DEFAULT_VERSION )         
              break
            case 4:
              test = ( elTemplate == CONST.JDE.MAIL_CONFIG.DEFAULT_VERSION )         
              break
            default:
              test = false
              log.error(CONST.MESSAGES.ERROR.INVALID_PRIORITY_CODE)
              break
          }
      
          return test
        })
      }

      let prioritisedEmailConfiguration = {}
      emailConfiguration = emailConfiguration.result.rows

      // Process each mail constituent part individually. EMAIL_TO, EMAIL_TEXT etc
      for (let el in CONST.JDE.MAIL_STRUCTURE) {

        let mailConstituent = CONST.JDE.MAIL_STRUCTURE[el]
        let constituentConfig = emailConfiguration.filter( function( el, i, original  ) {
          let emailConfigurationConstituent = el[2];
          let test = ( mailConstituent == emailConfigurationConstituent.trim() ); 
          return test;
        })

        // Working with a filtered list of email configuration for the current constituent part
        // allocate the correct prioritised configuration entry per Priority order:
        //
        // Priority 1 : Configuration matching the Template and Language code 
        // Priority 2 : Configuration matching the Template  
        // Priority 3 : Configuration matching the Default *ALL and Language code 
        // Priority 4 : Configuration matching the Default
 
        let priorityConfig

        for ( let priority = 1; priority < 5;  priority++ ) {

          priorityConfig = _priorityFilter( constituentConfig, priority )  
          
          // Exit as soon some configuration is found at one of the priority levels.
          if ( priorityConfig.length !== 0  ) {
            log.debug(`Configuration found at Priority: ${priority} for : ${mailConstituent}`)
            log.debug(`${priorityConfig}`)
            break
          }
        }

        // At this point we have the correct configuration for the current mail constituent part 
        // according to the required email template and language so compose the response
        prioritisedEmailConfiguration[mailConstituent] = priorityConfig

      }

      log.debug(`PrioritisedConfiguration ::: ${JSON.stringify(prioritisedEmailConfiguration)}`)

      return prioritisedEmailConfiguration

    }

    function _assemble( emailConfiguration, emailTokens ) {

      let email = {} 
      let tmp = []

      // from
      tmp = emailConfiguration[CONST.JDE.MAIL_STRUCTURE.FROM]
      if ( tmp.length !== 0 ) {
        email.from = tmp[0][5]
      } else {
        email.from = ''
      }
       
      // To
      email.to = recipient

      // cc
      email.cc = ''

      // bcc 
      email.bcc = ''

      // Subject - Grab the subject data text from the correct column, if multiple entries concatenate all the text
      tmp = emailConfiguration[CONST.JDE.MAIL_STRUCTURE.SUBJECT].map(el => { return el.slice(5)  } )      
      email.subject = tmp.join('')

      // Body - grab the body text content from the correct column, concate all entries
      tmp = emailConfiguration[CONST.JDE.MAIL_STRUCTURE.BODY_HEAD].map(el => { return el.slice(5)} )
      email.html = tmp.join('')
      tmp = emailConfiguration[CONST.JDE.MAIL_STRUCTURE.BODY_BODY].map(el => { return el.slice(5)} )
      email.html += tmp.join('') 
      tmp = emailConfiguration[CONST.JDE.MAIL_STRUCTURE.BODY_FOOT].map(el => { return el.slice(5)} )
      email.html += tmp.join('')
      tmp = emailConfiguration[CONST.JDE.MAIL_STRUCTURE.BODY_LEGAL].map(el => { return el.slice(5)} )
      email.html += tmp.join('')
      
      log.verbose(`Email: ${JSON.stringify(email)}`)

      return email
    }


    // Fetch email configuration and token data from the database then apply the priority rules as per
    // Template and Language code to get the actual email configuration entries to be used for this email
    // Process the email content replacing any tokens for actual data then return the final email
    // object to be sent.

    try {

      dbResult = await database.readEmailConfiguration( CONST.JDE.MAIL_CONFIG.DEFAULT_VERSION, template )
      emailConfiguration = _prioritised(dbResult)

      dbResult = await database.readEmailTokens( id )
      emailTokens = _tokenised(dbResult) 

      resolve( _assemble( emailConfiguration, emailTokens ) )

    } catch( err ) {
      reject( err )

    } finally {

      // Noop

    }
  })

}


module.exports = compose



