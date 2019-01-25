const CONST = require('./const')
const config = require('./config')
const log = require('./log')
const database = require('./database')
const systemtokens = require('./systemtokens')

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
        let tokenValue = entry[4].trim()
        result[tokenName] = tokenValue

        return result
      })
      
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
        // Priority 4 : Configuration matching the Default *ALL
 
        let priorityConfig

        for ( let priority = 1; priority < 5;  priority++ ) {

          priorityConfig = _priorityFilter( constituentConfig, priority )  
          
          // Exit as soon some configuration is found at one of the priority levels.
          if ( priorityConfig.length !== 0  ) {
            log.debug(`Configuration found at Priority: ${priority} for : ${mailConstituent}`)
            log.debug(`${JSON.stringify(priorityConfig, null, '\t')}`)
            break
          }
        }

        // Collate the correct configuration entries for each mail constituent

        prioritisedEmailConfiguration[mailConstituent] = priorityConfig

      }

      log.debug(`PrioritisedConfiguration ::: ${JSON.stringify(prioritisedEmailConfiguration, null, '\t')}`)

      return prioritisedEmailConfiguration

    }

    function _assemble( emailConfiguration, emailTokens ) {

      let email = {} 
      let tmp = []

      function _extractConfigData( constituentType, joinType ) {

        let extractedData = []

        extractedData = emailConfiguration[constituentType].map(el => { return el.slice(5)  } )                
        return extractedData.join( joinType )
      }

      function _regexify( token ) {

        token = token.replace( CONST.JDE.MAIL_CONFIG.TOKEN_ID_LEAD, ' ' )
        token = token.replace( CONST.JDE.MAIL_CONFIG.TOKEN_ID_TRAIL, ' ' ).trim()

        return new RegExp( `\\${CONST.JDE.MAIL_CONFIG.TOKEN_ID_LEAD}${token}${CONST.JDE.MAIL_CONFIG.TOKEN_ID_TRAIL}`, 'gi'  )

      }

      function _deTokenise( text, emailTokens ) {

        let tokens = emailTokens.map( function( el, index ) {

          let token = Object.keys(el)[0]
          let value = Object.values(el)[0]

          log.debug(`Token: ${token} and value: ${value}`)

          token = _regexify( token )
          text = text.replace( token, value )

        })

        return text
      }


      // Assemble the mail constituents into a full Email object for nodemailer

      email.from = _extractConfigData( CONST.JDE.MAIL_STRUCTURE.FROM, ', ' )       
      email.to = _extractConfigData( CONST.JDE.MAIL_STRUCTURE.TO, ', ' )
      email.to = recipient + ', ' + email.to
      email.cc =  _extractConfigData( CONST.JDE.MAIL_STRUCTURE.CC, ', ')
      email.bcc =  _extractConfigData( CONST.JDE.MAIL_STRUCTURE.BCC, ', ')
      email.subject = _extractConfigData( CONST.JDE.MAIL_STRUCTURE.SUBJECT , '')
      email.html = _extractConfigData( CONST.JDE.MAIL_STRUCTURE.BODY_HEAD, '')
      email.html += _extractConfigData( CONST.JDE.MAIL_STRUCTURE.BODY_BODY, '')
      email.html += _extractConfigData( CONST.JDE.MAIL_STRUCTURE.BODY_FOOT, '')
      email.html += _extractConfigData( CONST.JDE.MAIL_STRUCTURE.BODY_LEGAL, '')

      // Scan and replace any Tokens embedded in Email Subject and/or Body with data values

      emailTokens = systemtokens.add( emailTokens ) 

      email.subject = _deTokenise( email.subject, emailTokens )
      email.html = _deTokenise( email.html, emailTokens )

      log.verbose(`Composed Email : ${JSON.stringify(email, null, '\t')}`)

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



