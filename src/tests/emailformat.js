const config = require('../lib/config')
const mailer = require('../lib/mailer')
const fetch = require('node-fetch')
const fs = require('fs');

const email = {}

const TABLE_ATTR = '';
const TD_ATTR = ` align="right" width="33%"`
const TR_ATTR = ``

email.from = config.mail.user
email.to = 'paul.green@dlink.com'
email.subject = 'Test email send from emailer'

email.html   = `<HTML><BODY>This is a test email to check format handling of html tables: <br><br><br> <TABLE ${TABLE_ATTR}>`
email.html   += `<TR><TD ${TD_ATTR}>2</TD><TD ${TD_ATTR}> </TD><TD ${TD_ATTR}>DWC-1000</TD></TR>`
email.html   += `<TR><TD ${TD_ATTR}>22</TD><TD ${TD_ATTR}> </TD><TD ${TD_ATTR}>DWC-2000</TD></TR>`
email.html   += `<TR><TD ${TD_ATTR}>222</TD><TD ${TD_ATTR}> </TD><TD ${TD_ATTR}>DWC-3000</TD></TR>`
email.html   += `</TABLE></BODY><HTML>`

mailer.send( email )




