const moment = require('moment')
const log = require('./log')

const JDE_DATE_BASE_CENTURY = 19

const helpers = {}

/**
 * Return a Julian Date in the JDE format CYYDDD
 * 
 * JDE Julian dates range from 1900 - 2899 
 *
 * @param {object} date - date to be converted
 *
 */
helpers.formatAsJdeJulian = function( date ) {
  
  let dt = moment(date)
  let ddd = moment(dt).dayOfYear()
  let yyyy = moment(dt).format('YYYY') 
  let yy = moment(dt).format('YY')
  let cc = yyyy.substr(0,2)
  let c = parseInt(cc) - JDE_DATE_BASE_CENTURY

  log.debug(`Date is ${dt} C is ${c} YYYY is ${yyyy} YY is ${yy} and ddd is ${ddd}   `)

  jdeJulian = c.toString() + yy.padStart(2, '0') + ddd.toString().padStart(3, '0')

  return jdeJulian
}

helpers.getTokenValue = function( tokens, target ) {

  let result;

  tokens.forEach( function( el, index ) {

    let token = Object.keys(el)[0]
    let value = Object.values(el)[0]

    log.debug(`Token: ${token} and value: ${value}`)

    if ( token === target ) result = value;
  })

  return result;

}


module.exports = helpers


