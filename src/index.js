// Emailer - Configuration driven email with template substitution
//
// Email template data can be found in an Oracle database used by JDE along
// with transactional email requirements.
//
// Poll periodically and check for any email requirements, if found process each email 
// request, pulling email template, and pluggable token values from JDE database. 
// Once confirmed sent update JDE DB transaction file as processed or log error.

const config = require('./lib/config')

console.log('Config: ', config)
