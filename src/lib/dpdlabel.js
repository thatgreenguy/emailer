const config = require('./config')
const log = require('./log')
const fetch = require('node-fetch');
const fs = require('fs');

const dpdlabel = {};

dpdlabel.get = function ( parcelNumber ) {

  return new Promise( async function( resolve, reject ) {

    try {

      // let sendResponse
      let result
      let attachments = []; 
      let body = {};

      // Construct url to fetch the Label pdf print for a given Parcel number
      let apiLabelPrint = config.api.dpdLabels + '?username=' + config.api.dpdUser + '&password=' + config.api.dpdPassword + '&parcels=' + parcelNumber + '&printType=pdf';

      // Construct attachment Pdf filename
      let fileName = config.api.dpdFilenamePrefix;
      fileName += parcelNumber;
      fileName += config.api.dpdFilenameSuffix;

      let filePath = config.app.tmpFolder + fileName;

      log.warn('--------------------------------------------');
      console.log('api url : ', apiLabelPrint);
      console.log('filename : ', fileName);
      console.log('filepath : ', filePath);
      log.warn('--------------------------------------------');


      // sendResponse = await transport.sendMail(email)
      // result = sendResponse.messageId + ' ' + sendResponse.response.substring(0, 99 - sendResponse.messageId.length)

      sendResponse = await fetch( apiLabelPrint, {method: 'POST', body })
      .then( res => {

        if ( res.ok ) {
          
          const dest = fs.createWriteStream( fileName  );
          res.body.pipe( dest )

        } else {
          throw(`API DPD LABEL ERROR : ${url}`)
        }
      });

      result = {
        status: 'OK',
        fileName: fileName,
        filePath: filePath
      };

      resolve(result)

    } catch ( err )  {

      reject(err)

    } finally {
 
      // noop

    }

  })
}

module.exports = dpdlabel
