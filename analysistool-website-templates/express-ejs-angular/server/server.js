const express = require('express');
const morgan = require('morgan');
const config = require('../config.json');
const router = require('./routes/router');
const logger = require('./logger');

const app = express();
const port = config.port || 3000;

// configure view engine
app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);
app.set('layout', `${__dirname}/views/layout.ejs`);

// use config variables in our templates
Object.assign(app.locals, config);

// use morgan to log requests during development
if (!config.production)
    app.use(morgan('[:date[iso]] [:method] :url :status'));

// register routes and start application
app.use(router);
app.listen(port, e => {
    logger.info(`Application is running on port ${port}`);
});
