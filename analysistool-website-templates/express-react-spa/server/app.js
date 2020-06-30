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
app.use(express.static('client/build'));

// json parser middleware
app.use(express.json());

// compress all responses
app.use(compression());

// create required folders 
const requiredFolders = [
    config.logging.folder, 
    config.results.folder,
];
for (let folder of requiredFolders) {
    fs.mkdirSync(folder, {recursive: true});
}

// update aws configuration if all keys are supplied, otherwise
// fall back to default credentials/IAM role
if (config.aws && 
    config.aws.region && 
    config.aws.accessKeyId && 
    config.aws.secretAccessKey) {
    AWS.config.update(config.aws);
}

// log requests
app.use((request, response, next) => {
    logger.info([request.url, JSON.stringify(request.body)].join(' '));
    next();
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
            prefix: `${config.s3.prefix}/${id}/`
        }).promise();

        // validate existence of results
        if (!(objects.Contents && objects.Contents.length > 0))
            throw(`Results do not exist for id: ${id}`);

        // download results
        for (let key of objects.Contents) {
            logger.info(`Downloading result: ${key}`);
            const object = await s3.getObject(key).promise();
            
            const filepath = path.resolve(
                config.folder.result,

                path.basename(key),
            )
            await fs.writeFile()
            
            fs.writeFileSync(
                path.resolve(config.folder.result, key),
                object.Body
            );
        }

        let resultsFile = path.resolve(config.results.folder, `${id}.json`);
        if (fs.existsSync(resultsFile))
            response.sendFile(resultsFile);
        else
            response.json(false);

    } catch(error) {
        logger.error(error);
        response.status(500).json(error.toString());
    }


    try {
        const s3 = new AWS.S3();
        const id = request.params.id;
        if (!id) return response.status(400).error('Invalid ID');



        
        // upload results object to S3
        await s3.putObject({
            Body: JSON.stringify(results),
            Bucket: config.s3.bucket,
            Key: config.s3.prefix + `/${id}/results.json`
        }).promise();




        let params = request.body;
        params.id = crypto.randomBytes(16).toString('hex');
        params.originalTimestamp = new Date().getTime();

        // maximum message size is 256 KB
        // if larger messages need to be queued, upload message to s3
        // and specify the bucket/key in the message
        const results = await new AWS.SQS().sendMessage({
            QueueUrl: config.queue.url,
            MessageBody: JSON.stringify(params),
        }).promise();

        logger.info(`Enqueued message: ${results.MessageId}`);
        response.json(true);
    } catch(error) {
        logger.error(error);
        response.status(500).json(error.toString());
    }
});

// start application
app.listen(config.port, () => {
    logger.info(`Application is running on port: ${config.port}`)
});