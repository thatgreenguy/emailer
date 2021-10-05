const config = require('./config')
const log = require('./log')
const fetch = require('node-fetch');
const fs = require('fs');
const dpdlabel = require('./dpdlabel');
const upslabel = require('./upslabel');
const helpers = require('./helpers');

const attachments = {}

attachments.fetch = function ( template, email, tokens ) {

  return new Promise( async function( resolve, reject ) {

    let result = {};
    let attachments = []; 

    try {

      let templateCheck = template.trim();
      let labelType = email.attachlabel;

      log.debug(`Attachment processing: Tokens:: ${JSON.stringify(tokens)}`);

      let lookupToken = async function( token ) 
      {
        let v;
        try {
          tokens.forEach( (e) => {
            if ( Object.keys(e) == token ) v = e[token];
          })
          return v;
        } catch(e) {}
      };

      // We need to know the journey type of this parcel/shipment
      let journeyType = await lookupToken('JOURNEY_TYPE');
      let shipParcelNumber = await lookupToken('SHIP_PARCEL_NUMBER');
      let shipShipmentId =  await lookupToken('SHIP_SHIPMENT_ID');
      let returnParcelNumber = await lookupToken('RETURN_PARCEL_NUMBER');
      let returnOrderNumber =  await lookupToken('RETURN_ORDER_NUMBER');
      let returnShipmentId =  await lookupToken('RETURN_SHIPMENT_ID');

      // DPD Shipment Labels
      if ( labelType === 'DPD' ) {

        // Set DPD Parcel number according to Journey type
        if ( journeyType === 'RETURN' ) {
          parcelNumber = returnParcelNumber;
        } else {
          parcelNumber = shipParcelNumber;
        }

        // So long as we have a parcelNumber then go ahead and try to get the DPD Label for it
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

        // Set UPS number according to Journey type
        if ( journeyType === 'RETURN' ) {
          parcelNumber = returnShipmentId;
        } else {
          parcelNumber = shipShipmentId;
        }

        // So long as we have a parcelNumber then go ahead and try to get the UPS Label for it
        if ( parcelNumber !== undefined ) {

          // Get the Label attachment pdf file from UPS
          let labelData = await upslabel.get( parcelNumber );

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
