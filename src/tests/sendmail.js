const config = require('../lib/config')
const mailer = require('../lib/mailer')

const email = {}

email.from = config.mail.user
email.to = 'paul.green@homemail.com'
email.subject = 'Test email send from emailer'
email.text = 'This is a test email from emailer via gmail'

mailer.send( email )
