const CONST = require('./const')
const config = require('./config')
const log = require('./log')
const oracledb = require('oracledb')
const moment = require('moment')
const helpers = require('./helpers')

const credentials = {
  user: config.db.user,
  password: config.db.password,
  connectString: config.db.connectString
}

const SCHEMA = config.db.schema
const TOKEN = CONST.JDE.MAIL_CONFIG.TOKEN
const PROCESSED = CONST.JDE.MAIL_CONFIG.PROCESSED
const PROCESS_ERROR = CONST.JDE.MAIL_CONFIG.PROCESS_ERROR
const READY = CONST.JDE.MAIL_CONFIG.READY

const database = {}


database.checkQueue =  function() {

  return new Promise(async function(resolve, reject) {

    let dbConnection

    try {
      let sql = `select * from ${SCHEMA}.F55NB901 
        where EC55NBES = '${READY}' and ECEDSP not in ('${PROCESSED}', '${PROCESS_ERROR}') `
      let binds = []
      let options = {}
      log.debug(`checkQueue : SQL : ${sql}`)

      dbConnection = await oracledb.getConnection( credentials )
      let result = await dbConnection.execute( sql, binds, options )

      resolve( {result} )
      
    } catch ( err ) {
      reject( err )

    } finally {

      if ( dbConnection ) {
        try {

          await dbConnection.close()

        } catch ( err ) {
          log.error(`CONST.MESSAGES.ERROR.CONNECTION_CLOSE_FAILED $(err)`)
        }
      }
    }
  }) 
}

database.updateQueue = function( id, processedFlag, errorMessage ) {

  return new Promise(async function(resolve, reject) {

    let dbConnection

    try {

      let datestamp = moment()
      let timestamp = datestamp.format('h:mm:ss').split(':').join('')  
      let julianDate = helpers.formatAsJdeJulian(datestamp)

      let sql = `update ${SCHEMA}.F55NB901
        set ECEDSP = '${processedFlag}', ECUKEMES = '${errorMessage}', 
        ECDTSE = ${julianDate}, ECY55TDA2 = ${timestamp},
        ECUPMJ = ${julianDate}, ECUPMT = ${timestamp},
        ECPID = '${config.app.name}', ECJOBN = 'NODE', ECUSER = 'DOCKER' 
        where ECUKID = ${id} and EC55NBES = '${READY}' and ECEDSP <> '${PROCESSED}'`

      log.debug(`updateQueue : SQL : ${sql}`)

      let binds = []
      let options = { autoCommit: true }

      dbConnection = await oracledb.getConnection( credentials )

      let result = await dbConnection.execute( sql, binds, options )

      resolve( {result} )
      
    } catch ( err ) {
      reject( err )

    } finally {
      if ( dbConnection ) {
        try {
          await dbConnection.close()

        } catch ( err ) {
          log.error(`CONST.MESSAGES.ERROR.CONNECTION_CLOSE_FAILED $(err)`)
        }
      }
    }
  }) 
}

database.readEmailConfiguration = function(defaultVersion, templateVersion) {

  return new Promise(async function(resolve, reject) {

    let dbConnection

    try {
      let sql = `select CRPGM, CRVERNM, CRCFGSID, CRBLKK, CRSEQ, CRTASKMISC from ${SCHEMA}.F559890 
        where CRPGM = '${config.app.name}' and 
        CRVERNM in ( '${defaultVersion}', '${templateVersion}' )
        order by crvernm, crcfgsid, crblkk, crseq `
      let binds = []
      let options = {}
      log.debug(`readEmailConfiguration : SQL : ${sql}`)

      dbConnection = await oracledb.getConnection( credentials )
      let result = await dbConnection.execute( sql, binds, options )

      resolve( {result} )
      
    } catch ( err ) {
      reject( err )

    } finally {
      if ( dbConnection ) {
        try {
          await dbConnection.close()

        } catch ( err ) {
          log.error(`CONST.MESSAGES.ERROR.CONNECTION_CLOSE_FAILED $(err)`)
        }
      }
    }
  }) 
}

database.readTemplateLanguageEmailConfiguration = function(templateVersion, templateLanguage) {

  return new Promise(async function(resolve, reject) {

    let dbConnection

    try {

      // When no language code explicitly specified search for JDE default langugage code of space
      if ( templateLanguage === '' ) templateLanguage = ' '

      let sql = `select CRPGM, CRVERNM, CRCFGSID, CRBLKK, CRSEQ, CRTASKMISC from ${SCHEMA}.F559890 
        where CRPGM = '${config.app.name}' and 
        CRVERNM = '${templateVersion}' and CRBLKK = '${templateLanguage}' 
        order by crvernm, crcfgsid, crblkk, crseq `

      let binds = []
      let options = {}
      log.debug(`readTemplateLanguageEmailConfiguration : SQL : ${sql}`)

      dbConnection = await oracledb.getConnection( credentials )
      let result = await dbConnection.execute( sql, binds, options )

      resolve( {result} )
      
    } catch ( err ) {
      reject( err )

    } finally {
      if ( dbConnection ) {
        try {
          await dbConnection.close()

        } catch ( err ) {
          log.error(`CONST.MESSAGES.ERROR.CONNECTION_CLOSE_FAILED $(err)`)
        }
      }
    }
  }) 
}

database.readEmailTokens = function(id) {

  return new Promise(async function(resolve, reject) {

    let dbConnection

    try {
      let sql = `select * from ${SCHEMA}.F55NB911 
        where EDUKID = ${id} and ED55NBEDT = '${TOKEN}' `
      let binds = []
      let options = {}
      log.debug(`readEmailTokens : SQL : ${sql}`)

      dbConnection = await oracledb.getConnection( credentials )
      let result = await dbConnection.execute( sql, binds, options )

      resolve( {result} )
      
    } catch ( err ) {
      reject( err )

    } finally {
      if ( dbConnection ) {
        try {
          await dbConnection.close()

        } catch ( err ) {
          log.error(`CONST.MESSAGES.ERROR.CONNECTION_CLOSE_FAILED $(err)`)
        }
      }
    }
  }) 
}

database.readEmailAdditionalData = function(id) {

  return new Promise(async function(resolve, reject) {

    let dbConnection

    try {
      let sql = `select * from ${SCHEMA}.F55NB911 
        where EDUKID = ${id} and ED55NBEDT != '${TOKEN}'
        ORDER BY ED55NBEDT, EDLINENUM`
      let binds = []
      let options = {}
      log.debug(`readEmailAdditionalData : SQL : ${sql}`)

      dbConnection = await oracledb.getConnection( credentials )
      let result = await dbConnection.execute( sql, binds, options )

      resolve( {result} )
      
    } catch ( err ) {
      reject( err )

    } finally {
      if ( dbConnection ) {
        try {
          await dbConnection.close()

        } catch ( err ) {
          log.error(`CONST.MESSAGES.ERROR.CONNECTION_CLOSE_FAILED $(err)`)
        }
      }
    }
  }) 
}

module.exports = database
