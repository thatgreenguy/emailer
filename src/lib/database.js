const oracledb = require('oracledb')

const config = require('./config')

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

      dbConnection = await oracledb.getConnection( credentials )
      resolve( {} )
      
    } catch ( err ) {

      reject( err )

    } finally {

      if ( dbConnection ) {

        try {
          await dbConnection.close()
        } catch ( err ) {
          console.log('ERROR: Connection close failed', err)
        }
      }
    }
  }) 
}

module.exports = database
