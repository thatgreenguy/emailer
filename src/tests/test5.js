const emailTemplate  = require('../lib/emailTemplate.js');


const test1 = async function( name ) {

  answer = await emailTemplate.get( name );

  console.log('');
  console.log('TEST1 START -----------------------------');
  console.log('TEST1 RESULT ::: ', answer);
  console.log('TEST1 END -----------------------------');
  console.log('');

} 

test1('A1E DPDP'); 
test1('??? DPDP'); 


