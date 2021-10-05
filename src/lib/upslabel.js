const config = require('./config')
const log = require('./log')
const fetch = require('node-fetch');
const fs = require('fs');

const upslabel = {};

upslabel.get = function ( parcelNumber ) {

  return new Promise( async function( resolve, reject ) {

    try {

      // let sendResponse
      let result
      let attachments = []; 
      let headers = {};
      let body = {};

      // Construct url to fetch the Label pdf print for a given Parcel number
      let apiLabelPrint = config.api.upsLabels;

      // Construct attachment Pdf filename
      let fileName = config.api.upsFilenamePrefix;
      fileName += parcelNumber;
      fileName += config.api.upsFilenameSuffix;

      let filePath = config.app.tmpFolder + fileName;

      // Construct Headers and Body for API request
      headers.Content-Type = 'application/json';
      headers.Accept = 'application/json';
      headers.Username = config.api.upsUsername;
      headers.Password = config.api.upsPassword;
      headers.AccessLicenseNumber = config.api.upsAccount;

      body = 
      {
        "LabelRecoveryRequest":
        {
          "LabelSpecification":
          {
            "LabelImageFormat":
            {
              "Code":"PDF"
            }
          },
          "TrackingNumber":"1Z12345E8791315509"
        }
      };

      log.warn('--------------------------------------------');
      console.log('api url : ', apiLabelPrint);
      console.log('filename : ', fileName);
      console.log('filepath : ', filePath);
      console.log('headers : ', headers);
      console.log('body : ', body);
      log.warn('--------------------------------------------');


      // sendResponse = await transport.sendMail(email)
      // result = sendResponse.messageId + ' ' + sendResponse.response.substring(0, 99 - sendResponse.messageId.length)

      sendResponse = await fetch( apiLabelPrint, {
	method: 'POST', 
	body: body,
	headers: headers 
	})
      .then( res => {

        if ( res.ok ) {
          
          const dest = fs.createWriteStream( fileName  );
          res.body.pipe( dest )

        } else {
          throw(`API UPS LABEL ERROR : ${url}`)
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

module.exports = upslabel
