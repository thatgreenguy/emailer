const dotenv = require('dotenv')
const env = process.env.NODE_ENV || 'development'

dotenv.config()

const development = {
  app: {
    name: 'EMAILER',
    systemDateSeparator: process.env.DEV_SYSTEM_DATE_SEPARATOR || '-',
    logLevel: process.env.DEV_LOG_LEVEL || 'debug',
    pollingInterval: parseInt(process.env.DEV_POLLING_INTERVAL) || 5000
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
  }
}

const testing = {
  app: {
    name: 'EMAILER',
    systemDateSeparator: process.env.TEST_SYSTEM_DATE_SEPARATOR || '-',
    logLevel: process.env.TEST_LOG_LEVEL || 'verbose',
    pollingInterval: parseInt(process.env.TEST_POLLING_INTERVAL) || 5000
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
  }
}
const production = {
  app: {
    name: 'EMAILER',
    systemDateSeparator: process.env.LIVE_SYSTEM_DATE_SEPARATOR || '-',
    logLevel: process.env.DEV_LOG_LEVEL || 'info',
    pollingInterval: parseInt(process.env.LIVE_POLLING_INTERVAL) || 15000
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
  }
}

const config = {
  development,
  testing,
  production
}

module.exports = config[env]

