
tokens = [ { CUSTOMER_NAME: 'GUILLAUME LE MARECHAL' },
  { SUPPORT_TEL_NUMBER: '+33 0 176 548 417' },
  { RMA_NUMBER: '21000335' },
  { ITEM_NUMBER: 'DIR-615/E' },
  { CUSTOMER_ADDR_LINE1: 'Rampe du Pont-Neuf 17, 1' },
  { CUSTOMER_ADDR_LINE2: '' },
  { CUSTOMER_ADDR_CITY: 'Limoges' },
  { CUSTOMER_ADDR_STATE: '' },
  { CUSTOMER_ADDR_COUNTRY: 'France' },
  { CUSTOMER_ADDR_POSTCODE: '87000' },
  { SHIP_PARCEL_NUMBER: '' },
  { SHIP_SHIPMENT_ID: '' },
  { RETURN_PARCEL_NUMBER: '' },
  { RETURN_SHIPMENT_ID: '' },
  { RETURN_ORDER_NUMBER: '710819' },
  { JOURNEY_TYPE: 'RETURN' } ]


const lookupToken = function( tokens, token ) {

  let v;

  try {

    // Loop over tokens
    tokens.forEach( (e) => {
      console.log(e);
      if ( Object.keys(e) == token ) v = e[token]; 
    })

    return v;

  } catch (e) {
    // empty
  }
}

console.log('TEST 10 : Check array searching for token values : ')

journeyType = lookupToken( tokens, 'JOURNEY_TYPE' );
shipShipmentId = lookupToken( tokens, 'SHIP_SHIPMENT_ID' );
duff = lookupToken( tokens, 'DUFF' );

console.log('----------------------------');

console.log('Jourey type: ', journeyType);
console.log('ship shipment id : ', shipShipmentId);
console.log('duff  : ', duff );

console.log('FINSIHED');
