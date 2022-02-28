const database   = require('../lib/database');
const massrma = {}

massrma.identify =  async function getRmaItems(rmaType) {

  let dbResult = await database.singleOrMassRma( rmaType );
  let result = {}; 
  result.rowCount = dbResult.result.rows.length;
  if ( result.rowCount > 0 ) {
      result.success = true;
      result.rmaType = dbResult.result.rows[0][0].trim();
  } else {
      result.success = false;
      result.rmaType = '';
  }

  return result;
}

module.exports = massrma;





