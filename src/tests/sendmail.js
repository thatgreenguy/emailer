const config = require('../lib/config')
const mailer = require('../lib/mailer')
const fetch = require('node-fetch')
const fs = require('fs');

const email = {}

email.from = config.mail.user
email.to = 'paul.green@dlink.com'
email.subject = 'Test email send from emailer'
email.text = 'This is a test email from emailer via gmail'



// Test DPD rest api call for label

const testurl = 'https://integracijos.dpd.lt/ws-mapper-rest/parcelPrint_?username=testuser1&password=testpassword1&parcels=05809023172694&printType=pdf';
const body = {};

fetch(testurl, 
  { method: 'POST' , body}
)
.then(res => {

  // Check the Response is OK then create a new label pdf file from the returned binary data
  console.log('------------------------------------------');

  if ( res.ok ) {

    let fileName = 'DPD_Label_05809023172694.pdf';
    let filePath = '/app/src/' + fileName;

    const dest = fs.createWriteStream( fileName );
    res.body.pipe(dest);
    console.log('Response: ', res.ok, res.status)

    // Now send the email with the label pdf attachment


    email.attachments = [{
      filename: fileName,
      path: filePath
    }];

console.log(email)

    mailer.send( email )


  } else {
    console.log('Error Response: ', res.err);
  }
  console.log('------------------------------------------');

})



