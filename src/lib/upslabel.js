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

      // Construct url to fetch the Label pdf print for a given Parcel number
      let apiLabelPrint = config.api.upsLabels;

      // Construct attachment Pdf filename
      let fileName = config.api.upsFilenamePrefix;
      fileName += parcelNumber;
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
          "TrackingNumber":"1Z12345E8791315509"
        }
      };


      sendResponse = await fetch( apiLabelPrint, {
	method: 'POST', 
	headers: headers, 
	body: JSON.stringify(body)
	})
      .then( response => response.json())
      .then( res => {

        // Extract Label Image Data
        let bindata = atob( res.LabelRecoveryResponse.LabelResults.LabelImage.GraphicImage );

        console.log('Label Data::: ', bindata)

      })
      

        //if ( res.ok ) {
        //  const dest = fs.createWriteStream( fileName  );
        //  res.body.pipe( dest )
        //} else {
        //  let msg = JSON.stringify(res);
        //  throw(`API UPS LABEL ERROR : ${msg}`)
        //}
      // });
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
