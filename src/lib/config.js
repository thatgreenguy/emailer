const dotenv = require('dotenv')
const env = process.env.NODE_ENV || 'development'

dotenv.config()

const development = {
  app: {
    name: 'EMAILER',
    systemDateSeparator: process.env.DEV_SYSTEM_DATE_SEPARATOR || '-',
    logLevel: process.env.DEV_LOG_LEVEL || 'debug',
    pollingInterval: parseInt(process.env.DEV_POLLING_INTERVAL) || 5000,
    overrideAllRecipientsTo: process.env.DEV_OVERRIDE_ALL_RECIPIENTS_TO || '',
    tmpFolder: process.env.DEV_TMP_FOLDER || '/app/src/'
  },
  db: {
    user: process.env.DEV_DB_USER,
    password: process.env.DEV_DB_PASSWORD,
    connectString: process.env.DEV_DB_CONNECTSTRING,
    schema: process.env.DEV_DB_SCHEMA
  },
  mail: {
    host: process.env.DEV_MAIL_HOST,
    port: process.env.DEV_MAIL_PORT,
    user: process.env.DEV_MAIL_USER,
    password: process.env.DEV_MAIL_PASSWORD
  },
  api: {
    dpdUser: process.env.DEV_DPD_USER || 'testuser1',
    dpdPassword: process.env.DEV_DPD_PASSWORD || 'testpassword1',
    dpdLabels: process.env.DEV_DPD_URL || 'https://integracijos.dpd.lt/ws-mapper-rest/parcelPrint_',
    dpdFilenamePrefix: process.env.DEV_DPD_FILENAME_PREFIX || 'Dlink_DPD_',
    dpdFilenameSuffix: process.env.DEV_DPD_FILENAME_SUFFIX || '.pdf'
    upsUser: process.env.DEV_UPS_USER || 'testuser1',
    upsPassword: process.env.DEV_UPS_PASSWORD || 'testpassword1',
    upsAccount: process.env.DEV_UPS_ACCOUNT || 'testaccesslicensenumber',
    upsLabels: process.env.DEV_UPS_URL || 'https://wwwcie.ups.com/ship/v1/shipments/labels',
    upsFilenamePrefix: process.env.DEV_UPS_FILENAME_PREFIX || 'Dlink_UPS_',
    upsFilenameSuffix: process.env.DEV_UPS_FILENAME_SUFFIX || '.pdf'
  }
}

const testing = {
  app: {
    name: 'EMAILER',
    systemDateSeparator: process.env.TEST_SYSTEM_DATE_SEPARATOR || '-',
    logLevel: process.env.TEST_LOG_LEVEL || 'verbose',
    pollingInterval: parseInt(process.env.TEST_POLLING_INTERVAL) || 5000,
    overrideAllRecipientsTo: process.env.TEST_OVERRIDE_ALL_RECIPIENTS_TO || '',
    tmpFolder: process.env.TEST_TMP_FOLDER || '/app/src/'
  },
  db: {
    user: process.env.TEST_DB_USER,
    password: process.env.TEST_DB_PASSWORD,
    connectString: process.env.TEST_DB_CONNECTSTRING,
    schema: process.env.TEST_DB_SCHEMA
  },
  mail: {
    host: process.env.TEST_MAIL_HOST,
    port: process.env.TEST_MAIL_PORT,
    user: process.env.TEST_MAIL_USER,
    password: process.env.TEST_MAIL_PASSWORD
  },
  api: {
    dpdUser: process.env.TEST_DPD_USER || 'testuser1',
    dpdPassword: process.env.TEST_DPD_PASSWORD || 'testpassword1',
    dpdLabels: process.env.TEST_DPD_URL || 'https://integracijos.dpd.lt/ws-mapper-rest/parcelPrint_',
    dpdFilenamePrefix: process.env.TEST_DPD_FILENAME_PREFIX || 'Dlink_DPD_',
    dpdFilenameSuffix: process.env.TEST_DPD_FILENAME_SUFFIX || '.pdf'
    upsUser: process.env.TEST_UPS_USER || 'testuser1',
    upsPassword: process.env.TEST_UPS_PASSWORD || 'testpassword1',
    upsAccount: process.env.TEST_UPS_ACCOUNT || 'testaccesslicensenumber',
    upsLabels: process.env.TEST_UPS_URL || 'https://wwwcie.ups.com/ship/v1/shipments/labels',
    upsFilenamePrefix: process.env.TEST_UPS_FILENAME_PREFIX || 'Dlink_UPS_',
    upsFilenameSuffix: process.env.TEST_UPS_FILENAME_SUFFIX || '.pdf'
  }
}
const production = {
  app: {
    name: 'EMAILER',
    systemDateSeparator: process.env.LIVE_SYSTEM_DATE_SEPARATOR || '-',
    logLevel: process.env.LIVE_LOG_LEVEL || 'info',
    pollingInterval: parseInt(process.env.LIVE_POLLING_INTERVAL) || 15000,
    overrideAllRecipientsTo: process.env.LIVE_OVERRIDE_ALL_RECIPIENTS_TO || '',
    tmpFolder: process.env.LIVE_TMP_FOLDER || '/app/src/' 
   },
  db: {
    user: process.env.LIVE_DB_USER,
    password: process.env.LIVE_DB_PASSWORD,
    connectString: process.env.LIVE_DB_CONNECTSTRING,
    schema: process.env.LIVE_DB_SCHEMA
  },
  mail: {
    host: process.env.LIVE_MAIL_HOST,
    port: process.env.LIVE_MAIL_PORT,
    user: process.env.LIVE_MAIL_USER,
    password: process.env.LIVE_MAIL_PASSWORD
  },
  api: {
    dpdUser: process.env.LIVE_DPD_USER || 'testuser1',
    dpdPassword: process.env.LIVE_DPD_PASSWORD || 'testpassword1',
    dpdLabels: process.env.LIVE_DPD_URL || 'https://integracijos.dpd.lt/ws-mapper-rest/parcelPrint_',
    dpdFilenamePrefix: process.env.LIVE_DPD_FILENAME_PREFIX || 'Dlink_DPD_',
    dpdFilenameSuffix: process.env.LIVE_DPD_FILENAME_SUFFIX || '.pdf'
    upsUser: process.env.LIVE_UPS_USER || 'testuser1',
    upsPassword: process.env.LIVE_UPS_PASSWORD || 'testpassword1',
    upsAccount: process.env.LIVE_UPS_ACCOUNT || 'testaccesslicensenumber',
    upsLabels: process.env.LIVE_UPS_URL || 'https://wwwcie.ups.com/ship/v1/shipments/labels',
    upsFilenamePrefix: process.env.LIVE_UPS_FILENAME_PREFIX || 'Dlink_UPS_',
    upsFilenameSuffix: process.env.LIVE_UPS_FILENAME_SUFFIX || '.pdf'
  }
}

const config = {
  development,
  testing,
  production
}

module.exports = config[env]

