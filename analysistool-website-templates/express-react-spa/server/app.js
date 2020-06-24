const fs = require('fs');
const path = require('path');
const express = require('express');
const compression = require('compression');
const config = require('./config.json');
const logger = require('./utils/logger');
const calculate = require('./calculate')

// create express app
const app = express();

// serve public folder
app.use(express.static('client/build'));

// json parser middleware
app.use(express.json());

// compress all responses
app.use(compression());

// create folder(s) if needed
for (let folder of [config.logging.folder])
    if (!fs.existsSync(folder))
        fs.mkdirSync(folder, {recursive: true});

// log requests
app.use((request, response, next) => {
    logger.info([request.url, JSON.stringify(request.body)].join(' '));
    next();
});

// handle submission
app.post('/submit', async (request, response) => {
    try {
        const results = await calculate(request.body);
        response.json(results);
    } catch(error) {
        logger.error(error);
        response.status(500).json(error.toString());
    }
});

// start application
app.listen(config.port, () => {
    logger.info(`Application is running on port: ${config.port}`)
});