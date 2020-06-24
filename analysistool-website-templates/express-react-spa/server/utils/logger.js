
const path = require('path');
const { createLogger, format, transports } = require('winston');
const config = require('../config.json');
require('winston-daily-rotate-file');

module.exports = new createLogger({
  level: config.logging.level || 'info',
  format: format.combine(
    format.errors({ stack: true }),
    // format.colorize(),
    format.timestamp(),
    format.prettyPrint(),
    format.label({ label: '[APPLICATION]' }),
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.printf(info => `[${info.timestamp}] [${info.level}] ${
        info.level === 'error' ? info.stack : info.message
    }`),
    // format.simple() outputs:
    // `${level}: ${message} ${[Object with everything else]}`
    // To customize this format, use format.printf (as above)
  ),
  transports: [
    new (transports.DailyRotateFile)({
      filename: path.resolve(config.logging.folder, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: false,
      maxSize: '1024m',
      timestamp: true,
      maxFiles: '1d',
      prepend: true
    }),
    new transports.Console()
  ],
  exitOnError: false
});