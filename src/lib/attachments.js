const config = require('./config')
const log = require('./log')

const attachments = {}

attachments.fetch = function (email) {

  return new Promise( async function( resolve, reject ) {

    // let sendResponse
    let result
    let attachments = []; 

    try {


      // sendResponse = await transport.sendMail(email)
      // result = sendResponse.messageId + ' ' + sendResponse.response.substring(0, 99 - sendResponse.messageId.length)


      let fileName = 'DPD_Label_05809023172694.pdf';
      let path = '/app/src/';

      let attachment = {};
      attachment.filename = fileName;
      attachment.path = path + fileName;
      attachments.push( attachment );


      result = attachments 

      resolve(result)

    } catch ( err )  {

      log.debug(`Attachment fetch Failed: ${JSON.stringify(err, null, '\t')}`)

      reject(err)

    } finally {
 
      // noop

    }

  })
}

module.exports = attachments
