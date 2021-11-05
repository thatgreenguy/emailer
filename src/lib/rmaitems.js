const database  = require('../lib/database');

const rmaitems = {};

rmaitems.get =  async function getRmaItems(rmaNo, rmaType, decimals = -2) {

  let result = await database.getRmaItems( rmaNo , rmaType );
  let rows = result.result.rows;
  let list = [];

  for( let i = 0; i < rows.length; i++ ) {

    let item = rows[i][2];
    let qty = '' + rows[i][3];

    if ( qty  == '0' ) {
      item = rows[i][4];
      qty = '' + rows[i][5];    
    }

    let line = `${item}     ${qty.slice(0, decimals)}`;
    list.push( line );
  }

  return list;

}

module.exports = rmaitems;

