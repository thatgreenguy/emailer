const database  = require('../lib/database');
const massrma  = require('../lib/massrma');
const rmaitems = {};

const TBS = '<table>';
const TBE = '</table>';
const TBRS = '<tr>';
const TBRE = '</tr>';
const TBCS = '<td align="left "width="45%">'
const TBCSA = '<td width="10%">';
const TBCE = '</td>';

rmaitems.get =  async function getRmaItems(rmaNo, rmaType,  decimals = -2) {

  // RMA Type Special Handling code hods M for Mass RMA otherwise Single
  let identifyResult = await massrma.identify( rmaType );

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

    // RMA Type Special Handling code identifies an RMA as Single or Mass for the purposes 
    // of displaying ITEM + QTY or just ITEM
    if ( result.length == 1 ) {
  
      if ( identifyResult.rmaType === 'M' ) {

        // Only 1 line on RMA but Rma Type identifies it as a Mass RMA so include Quantity
        // Mass RMA shows table of Item/Product codes with Quantity 
        let trimQty = `${qty.slice(0, decimals)}`;
        value = `${TBS}`;
        value += `${TBRS}${TBCS}${item}${TBCE}${TBCSA} ${TBCE}${TBCS}${trimQty}${TBCE}${TBRE}`;
        value += `${TBE}`;

      } else {

        // Single RMA shows just the Item/Product code
        value = item; 

      } 

    } else {

      // Trim and Pad Qty in case its required for output
      let trimQty = `${qty.slice(0, decimals)}`;
      let paddedQty = trimQty.padStart((10 - trimQty.length), ' ');

      // When handling a multiline RMA the UDC setup option still allows for Item display only 
      // Although unlikely to be used in real life
      if ( identifyResult.rmaType === 'M' ) {

        // Mass RMA shows table of Item/Product codes with Quantity 
        if ( i == 0 ) value = `${TBS}`;
        value += `${TBRS}${TBCS}${item}${TBCE}${TBCSA} ${TBCE}${TBCS}${trimQty}${TBCE}${TBRE}`;

      } else {

        // Mass RMA shows table of Item/Product codes without Quantity
        if ( i == 0 ) value = `${TBS}`;
        value += `${TBRS}${TBCS}${item}${TBCE}${TBCSA} ${TBCE}${TBCS} ${TBCE}${TBRE}`;

      }

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





