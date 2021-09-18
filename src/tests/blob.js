const database  = require('../lib/database');
const { StringDecoder } = require('string_decoder');
const decoder = new StringDecoder('utf8');

async function fetchTemplate() {

  let result = await database.getEmailTemplateBlob('A1E DPDP');

  //console.log('Result: ', JSON.stringify(result))

  let row = result.result.rows[0]

  //console.log('Result: Row: ', row)
  //console.log('Result: Row: ', row.length)

  let clob = row[0];
  //console.log('Result: CLOB ::: ', clob)
  

  //console.log('Email Template Data: ', row)

  let tmp = row[0];
//  let template = tmp.toString("utf16le");
  let template = tmp.toString();

  console.log('template: ', template)

  let output = {}
  output.test1 = tmp.toString('ucs2');

 console.log('output::::: ', output)


}

fetchTemplate();




