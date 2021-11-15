const database  = require('../lib/database');

const rmaitems = {};

const TBS = '<table>';
const TBE = '</table>';

const TBRS = '<tr>';
const TBRE = '</tr>';

const TBCS = '<td width="33%">'
const TBCSA = '<td align="right" width="33%">';
const TBCE = '</td>';

rmaitems.get =  async function getRmaItems(rmaNo, rmaType,  decimals = -2) {

  let dbResult = await database.getRmaItems( rmaNo , rmaType );
  let rows = dbResult.result.rows;
  let value = '';
  let result = {};  

  result.length = rows.length;

  for( let i = 0; i < rows.length; i++ ) {

    let item = rows[i][2];
    let qty = '' + rows[i][3];

    if ( qty  == '0' ) {
      item = rows[i][4];
      qty = '' + rows[i][5];    
    }

    if ( result.length == 1 ) {
  
      // Single RMA shows just the Item/Product code
      value = item; 

    } else {

      // Mass RMA shows table of Quantity with Item/Product Code
      let trimQty = `${qty.slice(0, decimals)}`;
      let paddedQty = trimQty.padStart((10 - trimQty.length), ' ');

      if ( i == 0 ) value = `${TBS}`;
      value += `${TBRS}${TBCSA}${paddedQty}${TBCE}${TBCS} ${TBCE}${TBCS}${item}${TBCE}${TBRE}`;


    }
  }

  if ( result.length > 1 ) value += `${TBE}`;
  result.value = value;

  return result;

}

module.exports = rmaitems;

// <table>
// <tr><td align="right">1</td><td><pre>     </pre></td><td>ITEMHERE</td></tr>
// <tr><td  align="right">666666</td><td><pre>     </pre></td><td>ITEMHERE</TD></tr>
// <tr><td  align="right">22</td><td><pre>     </pre></td><td>ITEMHERE</td></tr>
// <tr><td  align="right">333</td><td><pre>     </pre></td><td>ITEMHERE</TD></tr>
// </table>
