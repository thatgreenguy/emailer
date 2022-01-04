const database  = require('../lib/database');


// database.logEmailResponse = function( id, processedFlag, errorMessage, template, errorCount ) {

async function dotest() {

  let result = await database.logEmailResponse(331, 'E', 'PJG Test error msg', 'A1E DPDC', 4);

  console.log('We get : ', result)

}

dotest();




