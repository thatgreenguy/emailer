const fs = require('fs');

const fn = 'DL_DPD_Test1.pdf';
const attachment = {};

function getFileInfo(fn) { 

  attachment.msCutoff = 3 * 1024 * 1024;

  try {
    const stats = fs.statSync(fn);
    console.log(stats);

    attachment.size = stats.size;

    // Microsoft limit for inline attachments is 3MB so need two ways to handle file attachments
    if ( attachment.size > attachment.msCutoff ) {
      attachment.large = true;
    } else {
      attachment.large = false;
    }    



  } catch (err) {
    console.error(err);
  }

  return attachment;

}

module.exports = {
    getFileInfo
}
