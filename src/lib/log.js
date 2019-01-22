const config = require('./config')
const { createLogger, format, transports } = require('winston')
const { combine, timestamp, simple, colorize, prettyPrint } = format

const log = {}

const _logger = createLogger({
  level: config.app.logLevel,
  format: combine(
    colorize(),
    timestamp(),
    simple()
  ),
  transports: [
    new transports.Console()
  ]
})

log.error = function(message) {
  _logger.error( message )
}

log.warn = function(message) {
  _logger.warn( message )
}

log.info = function(message) {
  _logger.info( message )
}

log.verbose = function(message) {
  _logger.verbose( message )
}

log.debug = function(message) {
  _logger.debug( message )
}

log.silly = function(message) {
  _logger.silly( message )
}

module.exports = log
