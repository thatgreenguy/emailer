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

      let sql = `select * from CRPDTA.F55NB901 where F55NB901.EC55NBES = 'R' and F55NB901.ECEDSP <> 'Y'`
      let binds = []
      let options = {}

      dbConnection = await oracledb.getConnection( credentials )
      let result = await dbConnection.execute( sql, binds, options )

console.log('Query: ', sql)
console.log('Result: ', result)

      resolve( {result} )
      
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
