const CONST = require('./const')
const config = require('./config')
const log = require('./log')
const database = require('./database')
const validate = require('./validate')
const systemtokens = require('./systemtokens')
const { StringDecoder } = require('string_decoder');
const decoder = new StringDecoder('utf8');
const blob = require('./blob');

const attachmenttemplate = {}

attachmenttemplate.fetch = function( templateName, languageCode ) {

  log.debug(`Start fetching email attachment text - template: '${templateName}' and language: ${languageCode}`)

  let template = templateName.trim() 
  let language = typeof languageCode === 'string' ? languageCode.trim() : ' '	

  log.debug(`Working with language: '${language}' and template: '${template}'`)

  return new Promise(async function(resolve, reject) {

    let result = {};

    // Fetch email configuration and token data from the database then apply the priority rules as per
    // Template and Language code to get the actual email configuration entries to be used for this email
    // Process the email content replacing any tokens for actual data then return the final email
    // object to be sent.

    try {

      let dbResult;
      // let jdeAttachKey = `EMAILER|${template}|EMAIL_TEXT|${language}`;

      console.log('----------- Template: ', template);

      dbResult = await database.getEmailTemplateBlob( template );      
      let rows = dbResult.result.rows;
      if ( rows.length > 0 ) {

        // Found an attachment so use that in place of any old setup in F559890 
        let clob = rows[0];
        result.found = true;
        result.templateText = clob.toString('ucs2');

      } else {

        result.found = false;
        result.templateText = '';
      }


console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXxx');
console.log('resolve result has : ', result);
console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXxx');


      resolve( result )

    } catch( err ) {

      log.warn(`Caught error: '${JSON.stringify(err, null, '\t')}`)

      reject( err )

    } finally {

      // Noop

    }
  })

}


module.exports = attachmenttemplate

