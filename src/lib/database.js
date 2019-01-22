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

database.checkQueue = function() {

  return new Promise(async function(resolve, reject) {

    let dbConnection

    try {
      let sql = `select * from ${config.db.schema}.F55NB901 where F55NB901.EC55NBES = 'R' and F55NB901.ECEDSP <> 'Y'`
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

database.readEmailConfiguration = function(defaultVersion, templateVersion) {

  return new Promise(async function(resolve, reject) {

    let dbConnection

    try {
      let sql = `select * from ${config.db.schema}.F559890 
        where F559890.CRPGM = '${config.app.name}' and 
        F559890.CRVERNM in ( '${defaultVersion}', '${templateVersion}' )`
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
