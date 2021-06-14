const helpers = require('../lib/helpers');

const tokens = [
                {
                        "CUSTOMER_NAME": "PJG Test Name"
                },
                {
                        "RMA_TYPE": "A1"
                },
                {
                        "RMA_NUMBER": "21000118"
                },
                {
                        "ITEM_NUMBER": "DGS-1100-24P"
                },
                {
                        "CUSTOMER_ADDRESS": "PJG Street, Town, County, MK13 7GA"
                },
                {
                        "DPD_PARCEL_NUMBER": "05809023172694"
                }
        ]


const target = "XDPD_PARCEL_NUMBER";

let result = helpers.getTokenValue(tokens, target);

console.log(`Token ${target} has value ${result}`)



