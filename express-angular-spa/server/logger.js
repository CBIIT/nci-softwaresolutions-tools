const fs = require('fs-extra');
const path = require('path')
const winston = require('winston');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;
require('winston-daily-rotate-file');

const config = require('../config.json');
const logFolder = config.folders.logs;
const logFormat = combine(
    timestamp(),
    printf(info => `[${info.timestamp}] [${info.level}] ${info.message}`)
)

fs.ensureDirSync(logFolder);

const winstonTransports = [
    new transports.DailyRotateFile({
        level: 'info',
        filename: path.join(logFolder, 'app.%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        handleExceptions: true,
        format: logFormat,
    }),
];

if (!config.production)
    winstonTransports.push(new transports.Console({
        level: 'debug',
        handleExceptions: true,
        format: logFormat,
    }));

module.exports = createLogger({
    exitOnError: false,
    transports: winstonTransports,
});