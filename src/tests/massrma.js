const database   = require('../lib/database');

async function runtests(rmatyp) {

  let result = await database.singleOrMassRma( rmatyp );

  console.log(`------ BEGIN TEST : Single or Mass RMA ${rmatyp} ------------- `)
  console.log( result )
  console.log(`------ END TEST   : Single or Mass RMA ${rmatyp} ------------- `)
  console.log('')  
}

runtests('21000669', 'A1');
//runtests('21000130', 'A2');
//runtests('17009693', 'A7');
//runtests('17009693', 'A8');
//runtests('17009693', 'A4');




