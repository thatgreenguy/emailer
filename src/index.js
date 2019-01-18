// Test Oracle connection
const config = require('dotenv').config()
const oracledb = require('oracledb')

const credentials = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECTSTRING
}

oracledb.getConnection(credentials, function(err, cn) {
  if (err) {
    console.log('Nah Error : ' + JSON.stringify(err))
    throw new Error('DB Connection failed' + err)
  }
  console.log('We have a connection : ' + JSON.stringify(cn))
  cn.release(function(err) {
    if (err) {
      console.log('Error releasing connection')
      process.exit(1)
    }
    console.log('Connection released' + JSON.stringify(cn))
  })
})

