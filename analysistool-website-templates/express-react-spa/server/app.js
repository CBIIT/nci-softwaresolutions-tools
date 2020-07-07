const fs = require('fs').promises;
const path = require('path');
const express = require('express');
const compression = require('compression');
const AWS = require('aws-sdk');
const config = require('./config.json');
const logger = require('./utils/logger');
const calculate = require('./calculate');
const { validate } = require('./calculate');

// create express app
const app = express();

// serve public folder
app.use(express.static(config.server.static));

// json parser middleware
app.use(express.json());

// compress all responses
app.use(compression());

// log requests
app.use((request, response, next) => {
    logger.info([request.url, JSON.stringify(request.body)].join(' '));
    next();
});

// healthcheck route
app.get('/ping', (request, response) => {
    response.json(true);
});

// handle submission
app.post('/submit', async (request, response) => {
    try {
        const params = request.body;

        if (!validate(params))
            throw('Invalid parameters');

        const results = await calculate(params);
        response.json(results);
    } catch(error) {
        logger.error(error);
        response.status(500).json(error.toString());
    }
});

// handle queue submission
app.post('/submit-queue', async (request, response) => {
    try {
        let params = request.body;
        params.id = crypto.randomBytes(16).toString('hex');
        params.originalTimestamp = new Date().getTime();

        if (!validate(params))
            throw('Invalid parameters');

        // maximum message size is 256 KB
        // if larger messages need to be queued, upload the message to s3
        // and include the s3 object's bucket and key
        const results = await new AWS.SQS().sendMessage({
            QueueUrl: config.queue.url,
            MessageBody: JSON.stringify(params),
        }).promise();

        logger.info(`Queued message: ${results.MessageId}`);
        response.json(true);
    } catch(error) {
        logger.error(error);
        response.status(500).json(error.toString());
    }
});

// download output to results folder and return results
// if coming from an email link
app.get('/fetch-results', async (request, response) => {
    try {
        const s3 = new AWS.S3();
        const id = request.params.id; 

        // validate id format
        if (!/^[a-z0-9]$/i.test(id))
            throw('ID format is invalid');

        // find objects which use the specified id as the prefix
        const objects = await s3.listObjectsV2({
            Bucket: config.s3.bucket,
            prefix: `${config.s3.prefix}/${id}`
        }).promise();

        // validate existence of results
        if (!(objects.Contents && objects.Contents.length > 0))
            throw(`Results do not exist for id: ${id}`);

        // create results folder
        const resultsFolder = path.resolve(
            config.results.folder,
            path.basename(key),
        );
        await fs.mkdir(resultsFolder);            

        // download results
        for (let key of objects.Contents) {
            logger.info(`Downloading file: ${key}`);

            const filename = path.basename(key);
            const s3Object = await s3.getObject({
                Bucket: bucket,
                Key: key
            }).promise();

            await fs.writeFile(
                path.resolve(resultsFolder, filename),
                s3Object.Body
            );
        }

        let resultsFile = path.resolve(resultsFolder, `results.json`);
        if (fs.existsSync(resultsFile))
            response.sendFile(resultsFile);
        else
            response.json(false);

    } catch(error) {
        logger.error(error);
        response.status(500).json(error.toString());
    }
});

// serve index file, substituting base href for html5-routed pages
app.get('*/*', async (request, response) => {
    const indexTemplate = await fs.readFile(`${config.server.static}/index.html`);

    // determine base href from request url
    const baseHref = request.url
        .replace(/^\/+|\/+$/g, '')  // strip leading/ending slashes
        .replace(/[^/]+/g, '..');   // replace path components with '..'

    // set base href based on number of nested directories    
    const indexHtml = indexTemplate
        .toString()
        .replace(`<base href=".">`, `<base href="${baseHref}">`)
    response.send(indexHtml)
})

// start application
app.listen(config.server.port, async () => {
    logger.info(`Application is running on port: ${config.server.port}`);

    // update aws configuration if all keys are supplied, otherwise
    // fall back to default credentials/IAM role
    if (config.aws) {
        AWS.config.update(config.aws);
    }

    // create required folders 
    for (let folder of [config.logs.folder, config.results.folder]) {
        await fs.mkdir(folder, {recursive: true});
    }
});