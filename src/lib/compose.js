const CONST = require('./const')
const config = require('./config')
const log = require('./log')
const database = require('./database')
const validate = require('./validate')
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
 * Note: Email configuration for Templates is sensitive to language code and template name and empty/blank 
 *       language code will become ' ' which is default language in JDE 
 *
 */

compose.email = function(id, templateName, recipient, languageCode, attachmentTemplateText ) {

  log.debug(`Start composing email for - template: '${templateName}' and language: ${languageCode}`)

  let template = templateName.trim() 
  let language = typeof languageCode === 'string' ? languageCode.trim() : ' '	

  log.debug(`Working with language: '${language}' and template: '${template}'`)

  return new Promise(async function(resolve, reject) {

    let dbResult
    let emailConfiguration
    let emailTokens
    let validated
    let email
    let result

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

    function _collated(emailConfiguration) {

      let collatedEmailConfiguration = {}

      emailConfiguration = emailConfiguration.result.rows

      // Process each mail constituent part individually. EMAIL_TO, EMAIL_TEXT etc
      for (let el in CONST.JDE.MAIL_STRUCTURE) {

        let mailConstituent = CONST.JDE.MAIL_STRUCTURE[el]
        let constituentConfig = emailConfiguration.filter( function( el, i, original  ) {
          let emailConfigurationConstituent = el[2];
          let test = ( mailConstituent == emailConfigurationConstituent.trim() ); 
          return test;
        })

        // Collate the correct configuration entries for each mail constituent

        collatedEmailConfiguration[mailConstituent] = constituentConfig

      }

      return collatedEmailConfiguration

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

      // Email Template text was stored in multiple lines of EMAIL_TEXT within F559890 but now it can be setup more simply
      // in a media object text attachement against just 1 EMAIL_TEXT record
      // If attachmentTemplateText is available then override email.html here with the attachment template setup.

console.log('before: ', email.html)
      if ( attachmentTemplateText !== '' ) email.html = JSON.parse( JSON.stringify( attachmentTemplateText ) );
console.log('after: ', email.html)

      // Attachment handling will need to know whether to include attachments Y/N and parcel number
      email.attachlabel = _extractConfigData( CONST.JDE.MAIL_STRUCTURE.ATTACH_LABEL, '')

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

      dbResult = await database.readTemplateLanguageEmailConfiguration( template, language )
      emailConfiguration = dbResult.result.rows
      emailConfiguration = _collated(dbResult)

      validated = validate.checkConfiguration( emailConfiguration  )      

      if ( validated.valid ) {
        log.verbose(`Valid Email configuration found for Template: ${template} and Language: ${language}`)

        dbResult = await database.readEmailTokens( id )
        emailTokens = _tokenised(dbResult) 

        email = _assemble( emailConfiguration, emailTokens )

      } else {
        log.verbose(`Missing Email configuration for Template: ${template} and Language: ${language}`)

        email = {}

      }

      result = {
        email: email,
        status: validated,
        tokens: emailTokens
      }

      resolve( result )

    } catch( err ) {

      log.warn(`Caught error: '${JSON.stringify(err, null, '\t')}`)

      reject( err )

    } finally {

      // Noop

    }
  })

}


module.exports = compose



