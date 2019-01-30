const config = require('./config')
const CONST = require('./const')
const log = require('./log')

validate = {}

 
// Check the email configuration provides at least a From, Subject and Body as a minimum
// Otherwise don't send the email and mark it as in error

validate.checkConfiguration = function(emailConfiguration) {

  let valid = true
  let reason 

    // Iterate over minimum required Valid Email Structure and check each constituent is valid (not empty)
    for (let el in CONST.JDE.VALID_STRUCTURE) {

      let requiredMailConstituent = CONST.JDE.VALID_STRUCTURE[ el ]
      let constituentConfig = emailConfiguration[ requiredMailConstituent ]
   
      if ( constituentConfig.length === 0 ) {
        valid = false
        reason = `Missing setup: ${requiredMailConstituent}`
        break
      }
    }

  return {valid: valid, message: reason}

}

module.exports = validate
