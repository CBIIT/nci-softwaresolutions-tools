const express = require('express');
const helmet = require('helmet');
const logger = require('./logger');
const config = require('../config.json');
const app = express();

app.use(helmet());
app.use(require('./routes'));
app.listen(config.port, () =>
    logger.info(`Application started on port ${config.port}.`)
);