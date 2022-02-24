const rmaitems  = require('../lib/rmaitems');

async function runtests(rmano, rmatyp) {

  let result = await rmaitems.get( rmano, rmatyp );

  console.log(`------ BEGIN TEST : Items for RMA ${rmano} ${rmatyp} ------------- `)
  console.log( result )
  console.log(`------ END TEST   : Items for RMA ${rmano} ${rmatyp} ------------- `)
  console.log('')  
}

runtests('21000669', 'A1');
runtests('21000766', 'A7');
runtests('21000795', 'A2');
runtests('21000130', 'A8');
runtests('17009693', 'A8');




