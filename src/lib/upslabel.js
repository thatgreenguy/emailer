const config = require('./config')
const log = require('./log')
const fetch = require('node-fetch');
const fs = require('fs');

const upslabel = {};

upslabel.get = function ( parcelNumber ) {

  return new Promise( async function( resolve, reject ) {

    let trimmedParcelNumber = parcelNumber.trim();

    try {

      // let sendResponse
      let result
      let attachments = []; 
      let headers = {};

      // Construct url to fetch the Label pdf print for a given Parcel number
      let apiLabelPrint = config.api.upsLabels;

      // Construct attachment Pdf filename
      let fileName = config.api.upsFilenamePrefix;
      fileName += trimmedParcelNumber;
      fileName += config.api.upsFilenameSuffix;

      let filePath = config.app.tmpFolder + fileName;

      // Construct Headers and Body for API request
      headers["Content-Type"] = 'application/json';
      headers["Accept"] = 'application/json';
      headers["Username"] = config.api.upsUser;
      headers["Password"] = config.api.upsPassword;
      headers["AccessLicenseNumber"] = config.api.upsAccount;
      headers["charset"] = 'UTF-8';

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
          "TrackingNumber": trimmedParcelNumber
        }
      };


      sendResponse = await fetch( apiLabelPrint, {
	method: 'POST', 
	headers: headers, 
	body: JSON.stringify(body)
	})
      .then( response => response.json())
      .then( res => {

        // Valid Reponse or error
        let errorResponse = res.hasOwnProperty('response');

        if ( !errorResponse ) {
          let data = res.LabelRecoveryResponse.LabelResults.LabelImage.GraphicImage;
          fs.writeFile( filePath, data, { encoding: 'base64'}, async(err, data) => {
            if ( err ) throw(`API UPS LABEL ERROR : ${err}`);
            return;
          });
        } else {
            throw(`API UPS LABEL ERROR : ${JSON.stringify(res.response.errors)}`);
        }
      })
      .then( res => {
        result = {
          status: 'OK',
          fileName: fileName,
          filePath: filePath
        };
      })

      resolve(result)

    } catch ( err )  {
      reject(err)

    } finally {
      // noop
    }
  })
}

module.exports = upslabel
