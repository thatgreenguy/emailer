const dpdlabel = require('../lib/dpdlabel');

const parcelNumber = '05809023172694';

const call = async function() {

  try {
   let result = await dpdlabel.get( parcelNumber  );
   console.log('RESULT: ', result)
  } catch (err) {
    console.log('ERROR: ', err);
  }
}

call();
