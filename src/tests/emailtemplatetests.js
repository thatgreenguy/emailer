const emailTemplate  = require('../lib/emailTemplate.js');


const test1 = async function( name, language ) {

  answer = await emailTemplate.get( name, language );

  console.log('');
  console.log(`TEST START ----------------------- ${name} ${language} ------`);
  console.log( answer );
  console.log(`TEST END   ----------------------- ${name} ${language} ------`);
  console.log('');

} 

test1('A1E DPDP'); 
test1('??? DPDP'); 
test1('??? DPDP', 'F'); 	// Should pickup a DEFAULT Template in French or English if no French or error if no English


