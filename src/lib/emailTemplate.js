const database  = require('../lib/database');
const { StringDecoder } = require('string_decoder');
const decoder = new StringDecoder('utf8');

const emailTemplate = {};

emailTemplate.get = function( templateName ) {

  return new Promise( async function(resolve, reject) {

    let result = {};
    let dbResult;

    try {

	dbResult = await database.getEmailTemplateBlob( templateName );

	let row = dbResult.result.rows[0];

	if ( row && row.length > 0 ) {

	  let clob = row[0];

	  result.found = true;
      	  result.text = clob.toString('UCS2');

        } else {

	  result.found = false;
 	  result.text = ` Email Template Text is missing for template name : "${templateName}" `;

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




