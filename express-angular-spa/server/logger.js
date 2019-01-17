const moment = require('moment');
const rfs = require('rotating-file-stream');
const { ensureDirSync } = require('fs-extra');
const { createLogger, format, transports } = require('winston');
const { folders: { logs: logsFolder } } = require('../config.json');

const dailyFileStream = filename => rfs(
    date => !date ? filename : `${filename}.${moment(date).format('YYYY-MM-DD')}`,
    { interval: '1d', path: logsFolder }
);

ensureDirSync(logsFolder);
module.exports = createLogger({
    level: process.env.LOG_LEVEL || 'debug',
    exitOnError: false,
    handleExceptions: true,
    format: format.combine(
        format.timestamp(),
        format.printf(e => `[${e.timestamp}] [${e.level}] ${e.message}`)
    ),
    transports: [
        new transports.Console(),
        new transports.Stream({
            stream: dailyFileStream('app.log'),
        }),
    ],
});