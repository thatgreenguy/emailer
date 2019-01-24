const CONST = require('./const')
const config = require('./config')
const log = require('./log')
const oracledb = require('oracledb')

const credentials = {
  user: config.db.user,
  password: config.db.password,
  connectString: config.db.connectString
}

const database = {}

// TESTING only...
// Create a delay function to give Mihai chance to see connections ....
const _artificialDelay = ( duration  ) => {
  return new Promise(resolve => setTimeout(resolve, duration))
}


database.checkQueue =  function() {

  return new Promise(async function(resolve, reject) {

    let dbConnection

    try {
      let sql = `select * from ${config.db.schema}.F55NB901 where F55NB901.EC55NBES = 'R' and F55NB901.ECEDSP <> 'Y'`
      let binds = []
      let options = {}

      dbConnection = await oracledb.getConnection( credentials )
      let result = await dbConnection.execute( sql, binds, options )


// TESTING only
// Add some delay code here to give Mihai a chance to see whats happening
//
          log.info(`Artificial Delay starting - you have 60 seconds`)
          await _artificialDelay(60000)
          log.info(`Artificial Delay over - continue with close connection`)

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

//      let sql = `update ${config.db.schema}.F55NB901 set F55NB901.ECEDSP = '${processedFlag}', 
//        F55NB901.ECUKEMES = '${errorMessage}', F55NB901.ECDTSE = 119024, F55NB901.ECY55TDA2 = 135003 
//        where F55NB901.ECUKID = ${id} and F55NB901.EC55NBES = 'R' and F55NB901.ECEDSP <> 'Y'`

      let sql = `update CRPDTA.F55NB901 set ECEDSP = 'Y'`

      let binds = []
      let options = { autoCommit: true }

log.warn(sql)

      dbConnection = await oracledb.getConnection( credentials )

log.warn(`connection: ${JSON.stringify(dbConnection)}`)

      let result = await dbConnection.execute( sql, binds, options )

log.warn(`${JSON.stringify(result)}`)

      resolve( {result} )
      
    } catch ( err ) {
log.warn(`${JSON.stringify(err)}`)
      reject( err )

    } finally {
log.warn(`${JSON.stringify(dbConnection)}`)
      if ( dbConnection ) {
        try {
          await dbConnection.close()

        } catch ( err ) {
          log.error(`CONST.MESSAGES.ERROR.CONNECTION_UPDATE_FAILED $(err)`)
        }
      }
    }
  }) 
}

database.readEmailConfiguration = function(defaultVersion, templateVersion) {

  return new Promise(async function(resolve, reject) {

    let dbConnection

    try {
      let sql = `select CRPGM, CRVERNM, CRCFGSID, CRBLKK, CRSEQ, CRTASKMISC from ${config.db.schema}.F559890 
        where F559890.CRPGM = '${config.app.name}' and 
        F559890.CRVERNM in ( '${defaultVersion}', '${templateVersion}' )
        order by crvernm, crcfgsid, crblkk, crseq `
      let binds = []
      let options = {}

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
      let sql = `select * from ${config.db.schema}.F55NB911 where F55NB911.EDUKID = ${id} and F55NB911.ED55NBEDT = '${CONST.JDE.MAIL_CONFIG.TOKEN}' `
      let binds = []
      let options = {}

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
      let sql = `select * from ${config.db.schema}.F55NB911 where F55NB911.EDUKID = ${id} and F55NB911.ED55NBEDT != '${CONST.JDE.MAIL_CONFIG.TOKEN}' ORDER BY ED55NBEDT, EDLINENUM`
      let binds = []
      let options = {}

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
