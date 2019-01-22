const ERROR_TEXT = `ERROR: `

CONST = {
  JDE: {
    MAIL_CONFIG: {
      DEFAULT_VERSION: '*ALL',
      TOKEN: 'TOKEN'
    }
  },
  MESSAGES: {
    ERROR: {
      ERROR: ERROR_TEXT,
      CONNECTION_CLOSE_FAILED: `${ERROR_TEXT} Connection close failed.`
    }
  }
}

module.exports = CONST
