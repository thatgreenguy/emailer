const upslabel = require('../lib/upslabel');

// const parcelNumber = '05809023172694';
const parcelNumber = '1Z12345E8791315509';

const call = async function() {

  try {
   let result = await upslabel.get( parcelNumber  );
   console.log('RESULT: ', result)
  } catch (err) {
    console.log('ERROR: ', err);
  }
}

call();
