const ERROR_TEXT = `ERROR: `

CONST = {
  JDE: {
    MAIL_CONFIG: {
      DEFAULT_VERSION: '*ALL',
      TOKEN: 'TOKEN',
      TOKEN_ID_LEAD: '[{',
      TOKEN_ID_TRAIL: '}]'
    },
    MAIL_STRUCTURE: {
      FROM: 'EMAIL_FROM',
      TO: 'EMAIL_TO',
      CC: 'EMAIL_CC',
      BCC: 'EMAIL_BCC',
      SUBJECT: 'EMAIL_SUBJECT',
      BODY_HEAD: 'EMAIL_TEXT_HEADER',
      BODY_BODY: 'EMAIL_TEXT',
      BODY_FOOT: 'EMAIL_TEXT_FOOTER',
      BODY_LEGAL: 'EMAIL_TEXT_DISCLAIMER'
    }
  },
  MESSAGES: {
    ERROR: {
      ERROR: ERROR_TEXT,
      CONNECTION_CLOSE_FAILED: `${ERROR_TEXT} Connection close failed.`,
      INVALID_PRIORITY_CODE: `${ERROR_TEXT} Internal error: Invalid Priority code should be 1-4.`
    }
  }
}

module.exports = CONST
