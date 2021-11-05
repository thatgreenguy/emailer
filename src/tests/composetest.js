const compose = require('../lib/compose');

let attachmentText = 'Hello, this is for testing only [{RMA_NUMBER}] so what do you think so far? Thats it. Plus the Item is here:::   [{ITEM_NUMBER}]   ::: how did we do?';

async function testCompose( id, templateName, recipient, languageCode, attachmentTemplateText ) {

  let result = await compose.email( id, templateName, recipient, languageCode, attachmentTemplateText );

  console.log('---------- BEGIN TEST Compose --------------------------------------')
  console.log(result )
  console.log('---------- END   TEST Compose --------------------------------------')

}

testCompose( 523, 'A1E SCRAP', 'paul.green@dlink.com', 'E', attachmentText );




