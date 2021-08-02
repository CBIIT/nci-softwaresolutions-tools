const path = require("path");
const util = require("util");
const fs = require("fs");
const { createLogger, format, transports, info } = require("winston");
const logConfig = require("../config.json").logs;
require("winston-daily-rotate-file");

function formatLog({ label, timestamp, level, message }) {
  const metadata = [label, process.pid, timestamp, level].map((s) => `[${s}]`);
  return [...metadata, util.format(message)].join(" ");
}

/**
 * Returns a winston logger using the specified label and configuration
 * @param {string} name
 * @param {object} config
 * @returns Logger
 */
function getLogger(name = "app", config = logConfig, formatter = formatLog) {
  const { folder, level } = {
    folder: "logs",
    level: "info",
    ...config,
  };

  fs.mkdirSync(folder, { recursive: true });

  return new createLogger({
    level: level,
    format: format.combine(
      format.timestamp({ format: "isoDateTime" }),
      format.label({ label: name }),
      format.printf(formatter),
    ),
    transports: [
      new transports.Console(),
      new transports.DailyRotateFile({
        filename: path.resolve(folder, `${name}-%DATE%.log`),
        datePattern: "YYYY-MM-DD-HH",
        zippedArchive: false,
        maxSize: "1024m",
        timestamp: true,
        maxFiles: "1d",
        prepend: true,
      }),
    ],
    exitOnError: false,
  });
}

module.exports = { formatLog, getLogger };
