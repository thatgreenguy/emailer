const config = require('./config')
const log = require('./log')
const fetch = require('node-fetch');
const fs = require('fs');

const dpdlabel = {};

dpdlabel.get = function ( parcelNumber ) {

  return new Promise( async function( resolve, reject ) {

    const readRes = {data: '', error: false};

    try {

      const writeAttachmentFile = ( response, fileName ) => {
        return new Promise((resolve, reject) => {

          if ( response.ok ) {
            const dest = fs.createWriteStream( fileName  );
            response.body.pipe( dest )
            .on('finish', () => resolve())
            .on('error', () => reject())
          } else {
             reject
          }
        })
      }

      const checkAttachmentFile = ( fileName ) => {
        return new Promise((resolve, reject) => {

        // Confirm we actually got a PDF file and not an error response from the API
        const source = fs.createReadStream( fileName, {highWaterMark: 25} );

        source.on('data', (chunk) => { 
          // examine the chunk it should be pdf binary data but if first chink contains following we don't have an attachment label rather an error response from DPD api
          if ( chunk == '{"status":"err","errlog":' ) readRes.error = true;
          readRes.data += chunk;
        });

        source.on('end', () => { 
          resolve();
        });

        source.on('error', (err) => { 
          readRes.data = err;
          readRes.error = true;
          reject();
        });

        })
      }


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

      sendResponse = await fetch( apiLabelPrint, {method: 'POST', body })
      .then( response => writeAttachmentFile(response, fileName) )
      .then( res => checkAttachmentFile(fileName) )
      .then( res => {

        if ( readRes.error ) {
          throw(`API DPD LABEL ERROR : ${JSON.stringify(readRes)} `);
        } else {
  
          result = {
            status: 'OK',
            fileName: fileName,
            filePath: filePath
          };
        }
      });

      resolve(result)

    } catch ( err )  {

      reject(err)

    } finally {
 
      // noop

    }

  })
}

module.exports = dpdlabel
