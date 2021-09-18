const config = require('./config')
const log = require('./log')
const fetch = require('node-fetch');
const fs = require('fs');
const dpdlabel = require('./dpdlabel');
const helpers = require('./helpers');

const attachments = {}

attachments.fetch = function ( template, email, tokens ) {

  return new Promise( async function( resolve, reject ) {

    let result = {};
    let attachments = []; 

    try {

      let templateCheck = template.trim();
      let labelType = email.attachlabel;

console.log('what info in tokens? : ', tokens )
console.log('what info in template ? : ', template  )


      // DPD Shipment Labels
      if ( labelType === 'DPD' ) {

        // Parcel number will be available as a Token
        let parcelNumber = helpers.getTokenValue(tokens, 'DPD_PARCEL_NUMBER');

	// TESTING ONLY 
        parcelNumber = '05809023172694';
	// TETING ONLY

        if ( parcelNumber !== undefined ) {

          // Get the Label attachment pdf file from DPD
          let labelData = await dpdlabel.get( parcelNumber );

          // When attachment retrieved okay then include in email send
          if ( labelData.status === 'OK' ) {
            let attachment = {};
            attachment.filename = labelData.fileName;
            attachment.path = labelData.filePath;
            attachments.push( attachment );
          }
        }
      }

      // UPS Shipment Labels
      if ( labelType === 'UPS' ) {

        // Parcel number will be available as a Token
        let parcelNumber = helpers.getTokenValue(tokens, 'DPD_PARCEL_NUMBER');

        if ( parcelNumber !== undefined ) {

          // Get the Label attachment pdf file from DPD
          let labelData = await dpdlabel.get( parcelNumber );

          // When attachment retrieved okay then include in email send
          if ( labelData.status === 'OK' ) {
            let attachment = {};
            attachment.filename = labelData.fileName;
            attachment.path = labelData.filePath;
            attachments.push( attachment );
          }
        }
      }


      // Either we have a DPD or UPS Label to attach or not - return result
      result.attachments = attachments;
      resolve(result)

    } catch ( err )  {

      log.debug(`Attachment fetch Failed: ${JSON.stringify(err, null, '\t')}`)

      reject(err)

    } finally {
 
      // noop

    }

  })
}

attachments.remove = function ( attachments ) {

  return new Promise( async function( resolve, reject ) {

    let result = {};

    try {

      // Once attachments are sent remove them from local storage
      attachments.forEach( function(el, index) {

        let removeFile =  el.path;
        fs.unlinkSync( removeFile, (err) => {
          if ( err ) {
            throw err;
            return;
          }          
        })
      });


      log.debug('Removed Attachments : ', attachments);

      result.status = 'OK';
      resolve(result)

    } catch ( err )  {

      log.debug(`Attachment remove Failed: ${JSON.stringify(err, null, '\t')}`)

      reject(err)

    } finally {
 
      // noop

    }

  })
}

module.exports = attachments
