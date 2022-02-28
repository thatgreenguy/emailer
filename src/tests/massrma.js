const massrma = require('../lib/massrma');

async function runtests(rmatyp) {

  let result = await massrma.identify( rmatyp );

  console.log(`------ BEGIN TEST : Single or Mass RMA ${rmatyp} ------------- `)
  console.log( result )
  if ( result.rmaType === 'M' ) {
    console.log( '  MASS RMA - include Qty');
  } else {
    console.log( '  SINGLE RMA - Leave Qty');
  }

  console.log(`------ END TEST   : Single or Mass RMA ${rmatyp} ------------- `)
  console.log('')  
}

runtests('A1');
runtests('A2');
runtests('A7');
runtests('A8');
runtests('A4');
runtests('A?');
runtests('');
runtests();




