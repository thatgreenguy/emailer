const CONST = require('./const')
const config = require('./config')
const log = require('./log')
const moment = require('moment')

systemtokens = {}

systemtokens.add = function( tokens  ) {

  let systemTokens = []
  let today = moment()
  let separator = config.app.systemDateSeparator

  let yyyymmdd = `YYYY${separator}MM${separator}DD` 
  let yymmdd = `YY${separator}MM${separator}DD` 
  let ddmmyyyy = `DD${separator}MM${separator}YYYY` 
  let ddmmyy = `DD${separator}MM${separator}YY` 
  let mmddyyyy = `MM${separator}DD${separator}YYYY` 
  let mmddyy = `MM${separator}DD${separator}YY` 


  systemTokens.push({ "SYSTEM_DATE_YYYYMMDD": today.format(yyyymmdd) })
  systemTokens.push({ "SYSTEM_DATE_DDMMYYYY": today.format(ddmmyyyy) })
  systemTokens.push({ "SYSTEM_DATE_MMDDYYYY": today.format(mmddyyyy) })
  systemTokens.push({ "SYSTEM_DATE_YYMMDD": today.format(yymmdd) })
  systemTokens.push({ "SYSTEM_DATE_DDMMYY": today.format(ddmmyy) })
  systemTokens.push({ "SYSTEM_DATE_MMDDYY": today.format(mmddyy) })
  systemTokens.push({ "SYSTEM_DATE_LONG": today.format('Do MMMM YYYY') })
  systemTokens.push({ "SYSTEM_DATE_FULL": today.format('dddd, MMMM Do YYYY') })

  return systemTokens.concat( tokens ) 

}

module.exports = systemtokens

