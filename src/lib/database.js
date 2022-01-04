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
const PROCESS_SENDING = CONST.JDE.MAIL_CONFIG.PROCESS_SENDING
const PROCESS_ERROR = CONST.JDE.MAIL_CONFIG.PROCESS_ERROR
const READY = CONST.JDE.MAIL_CONFIG.READY

const database = {}


database.checkQueue =  function() {

  return new Promise(async function(resolve, reject) {

    let dbConnection

    try {
      let sql = `select * from ${SCHEMA}.F55NB901 
        where EC55NBES = '${READY}' and ECEDSP not in ('${PROCESSED}', '${PROCESS_SENDING}'  ,'${PROCESS_ERROR}') `
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

database.updateQueueSending = function( id, processedFlag, errorMessage, template ) {

  return new Promise(async function(resolve, reject) {

    let dbConnection

    try {

      let datestamp = moment()
      let timestamp = datestamp.format('h:mm:ss').split(':').join('')  
      let julianDate = helpers.formatAsJdeJulian(datestamp)

      let sql = ''
 
      sql = `update ${SCHEMA}.F55NB901
        set ECEDSP = :1 , ECUPMJ = ${julianDate}, ECUPMT = ${timestamp},
        ECPID = '${config.app.name}', ECJOBN = 'NODE', ECUSER = 'DOCKER' 
        where ECUKID = ${id} and EC55NBES = '${READY}' and ECEDSP <> '${PROCESSED}'`

      log.debug(`updateQueueSending : SQL : ${sql}`)

      let binds = [ PROCESS_SENDING ]
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

database.updateQueue = function( id, processedFlag, errorMessage, template, errorCount ) {

  return new Promise(async function(resolve, reject) {

    let dbConnection

    try {

      let datestamp = moment()
      let timestamp = datestamp.format('h:mm:ss').split(':').join('')  
      let julianDate = helpers.formatAsJdeJulian(datestamp)

      let f56cm33Status = 'C';
      if ( processedFlag === 'E' ) f56cm33Status = 'B';


      // Ensure internal error information or response from gmail API does not exceed space we have to store error message text
      if ( errorMessage.length >= 100 ) errorMessage = errorMessage.substring(0, 100)

      log.debug(`feedback message: ${errorMessage} and: ${errorMessage.length}`)

      // Template dictates whether we update the send date/time or not
      // Only update those columns when dealing with a Reminder Email Template
      let sql = ''

      if ( template === 'NBDSRN    '  ) {

        sql = `update ${SCHEMA}.F55NB901
          set ECEDSP = '${processedFlag}', ECUKEMES = :1 , 
          ECDTSE = ${julianDate}, ECY55TDA2 = ${timestamp},
          ECUPMJ = ${julianDate}, ECUPMT = ${timestamp},
          ECPID = '${config.app.name}', ECJOBN = 'NODE', ECUSER = 'DOCKER', ECY55ERRC = ${errorCount}, ECY55EDSP1 = '${f56cm33Status}' 
          where ECUKID = ${id} and EC55NBES = '${READY}' and ECEDSP <> '${PROCESSED}'`

      } else {
 
        sql = `update ${SCHEMA}.F55NB901
          set ECEDSP = '${processedFlag}', ECUKEMES = :1 , 
          ECUPMJ = ${julianDate}, ECUPMT = ${timestamp},
          ECPID = '${config.app.name}', ECJOBN = 'NODE', ECUSER = 'DOCKER', ECY55ERRC = ${errorCount}, ECY55EDSP1 = '${f56cm33Status}' 
          where ECUKID = ${id} and EC55NBES = '${READY}' and ECEDSP <> '${PROCESSED}'`

      }

      log.debug(`updateQueue : SQL : ${sql}`)

      let binds = [ errorMessage ]
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


database.getEmailTemplate = function(txky) {

  return new Promise(async function(resolve, reject) {

    let dbConnection

    try {
      // select utl_raw.cast_to_varchar2(dbms_lob.substr(gdtxft, 3200, 1)) from crpdta.f00165 where gdobnm = 'GT559890A';
      let sql = `select utl_raw.cast_to_varchar2(dbms_lob.substr(gdtxft, 3200, 1)) from ${SCHEMA}.f00165   
        where GDOBNM = 'GT559890A' and GDTXKY = '${txky}' and GDGTITNM = 'Text1'`
      let binds = []
      let options = {}
      log.debug(`getEmailTemplate : SQL : ${sql}`)

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

database.getEmailTemplateBlob = function(txky) {

  return new Promise(async function(resolve, reject) {

    let dbConnection

    try {
      // select utl_raw.cast_to_varchar2(dbms_lob.substr(gdtxft, 3200, 1)) from crpdta.f00165 where gdobnm = 'GT559890A';
      let sql = `select gdtxft from ${SCHEMA}.f00165   
        where GDOBNM = 'GT559890A' and GDGTITNM = '${txky}' and GDTXKY like '%|EMAIL_TEXT|%'`
      let binds = []
      let options = {};

      log.debug(`getEmailTemplate : SQL : ${sql}`)

      // oracledb.fetchAsString = [ oracledb.CLOB ];
      oracledb.fetchAsBuffer = [ oracledb.BLOB ];

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

database.getRmaItems = function(rmaNo, rmaType) {

  return new Promise(async function(resolve, reject) {

    let dbConnection

    try {
      let sql = `select RDRLLN, RDRMAST, RDLITM, RDUORG, RDCPIL, RDTRQT  from ${SCHEMA}.F40051 
        where RDRORN = '${rmaNo}' and RDRCTO = '${rmaType}' `
      let binds = []
      let options = {}
      log.debug(`getRMAItems : SQL : ${sql}`)

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

database.logEmailResponse = function( id, processedFlag, errorMessage, template, errorCount ) {

  return new Promise(async function(resolve, reject) {

    let dbConnection

    try {

      let datestamp = moment()
      let timestamp = datestamp.format('h:mm:ss').split(':').join('')  
      let julianDate = helpers.formatAsJdeJulian(datestamp)

      // Ensure internal error information or response from gmail API does not exceed space we have to store error message text
      if ( errorMessage.length >= 500 ) errorMessage = errorMessage.substring(0, 500)

      log.debug(`feedback message: ${errorMessage} and: ${errorMessage.length}`)

      // Template dictates whether we update the send date/time or not
      // Only update those columns when dealing with a Reminder Email Template
      let sql = ''

      let f56cm33Status = 'C';
      if ( processedFlag === 'E' ) f56cm33Status = 'B';
 
      sql = `insert into crpdta.f56cm33 (SRUKID, SRy55ERRC, SRIMAG, SRY55EDSP1, SRECDE, SRS74ERDC, SR79AGHGT, SRUPMJ, SRUPMT, SRPID, SRUSER, SRJOBN) 
          VALUES( ${id} , ${errorCount}, 0, '${f56cm33Status}', '', '${errorMessage}', '', ${julianDate}, ${timestamp}, '${config.app.name}', 'DOCKER', 'NODE'   )`;

      log.debug(`logEmailResponse : SQL : ${sql}`)

      let binds = [ ]
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

module.exports = database


