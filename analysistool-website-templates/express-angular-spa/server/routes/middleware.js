const moment = require('moment');
const morgan = require('morgan');
const rfs = require('rotating-file-stream');
const { compose } = require('compose-middleware');
const { folders: { logs: logsFolder } } = require('../../config.json');

const logFormat = '[:date[iso]] [:remote-addr] [:method] :url :status - :response-time ms';
const logFileStream = rfs(
    date => !date ? `access.log` : `access.${moment(date).format('YYYY-MM-DD')}.log`,
    { interval: '1d', path: logsFolder }
);

module.exports = compose([
    morgan(logFormat),
    morgan(logFormat, { stream: logFileStream })
]);