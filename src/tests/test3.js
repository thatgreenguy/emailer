const database  = require('../lib/database');
const { StringDecoder } = require('string_decoder');
const decoder = new StringDecoder('utf8');

async function fetchTemplate() {

  let result = await database.getEmailTemplate('EMAILER|DPDC|EMAIL_TEXT|');
  let row = result.result.rows[0]

  console.log('Email Template Data: ', row)

  let tmp = row[0];
  let template = tmp.toString("utf16le");

  console.log('template: ', template)

  let output = {}
  output.test1 = template;

 console.log('output::::: ', output)


}

fetchTemplate();




