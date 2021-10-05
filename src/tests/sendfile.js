const config = require('../lib/config')
const mailer = require('../lib/mailer')
const fetch = require('node-fetch')
const fs = require('fs');

const email = {}

email.from = config.mail.user
email.to = 'paul.green@dlink.com'
email.subject = 'Test email send from emailer'
email.text = 'This is a test email from emailer via gmail'


// Send file via email

let fileName = 'Dlink_UPS_1Z12345E8791315509.pdf' 
let filePath = '/app/src/' + fileName;

// Now send the email with the label pdf attachment
email.attachments = [{
  filename: fileName,
  path: filePath
}];

console.log(email)

mailer.send( email )





