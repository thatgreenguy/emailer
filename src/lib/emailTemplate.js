const database  = require('../lib/database');
const { StringDecoder } = require('string_decoder');
const decoder = new StringDecoder('utf8');

const emailTemplate = {};
const FALLBACK = 'DEFAULT';

emailTemplate.get = function( templateName, language = 'E' ) {

  return new Promise( async function(resolve, reject) {

    let result = {};
    let dbResult;

    try {

        let row;
        let clob;
        let fallbackName;

	dbResult = await database.getEmailTemplateBlob( templateName );
	row = dbResult.result.rows[0];
	if ( row && row.length > 0 ) {
	  clob = row[0];
	  result.found = true;
      	  result.text = clob.toString('UCS2');
          result.actualTemplate = templateName;

        } else {

          // Not able to find the template name provided so fallback to default templates
          // First try Default template by language
          fallbackName = `${FALLBACK} ${language}`;

  	  dbResult = await database.getEmailTemplateBlob( fallbackName );
	  row = dbResult.result.rows[0];
	  if ( row && row.length > 0 ) {
	    clob = row[0];
	    result.found = true;
      	    result.text = clob.toString('UCS2');
            result.actualTemplate = fallbackName;

          } else {

            // Then try Default template in English
            fallbackName = `${FALLBACK} E`;

    	    dbResult = await database.getEmailTemplateBlob( fallbackName );
	    row = dbResult.result.rows[0];
	    if ( row && row.length > 0 ) {
	      clob = row[0];
	      result.found = true;
      	      result.text = clob.toString('UCS2');
              result.actualTemplate = fallbackName;

            } else {
	      result.found = false;
 	      result.text = ` Email Template Text is missing for template name : "${templateName}" `;
            }
          }
        }

      resolve(result);

    } catch (err) {

      reject(err);

    } finally {
      // noop
    }
  })
}

module.exports = emailTemplate;




