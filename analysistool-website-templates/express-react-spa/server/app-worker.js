const fs = require('fs').promises;
const path = require('path');
const AWS = require('aws-sdk');
const nodemailer = require('nodemailer');
const config = require('./config.json');
const logger = require('./utils/logger');
const convert = require('./convert');
const calculate = require('./calculate');

(async function main() {
    // update aws configuration if all keys are supplied, otherwise
    // fall back to default credentials/IAM role
    if (config.aws) {
        AWS.config.update(config.aws);
    }

    // create required folders 
    for (let folder of [config.logs.folder, config.results.folder]) {
        await fs.mkdir(folder, {recursive: true});
    }

    receiveMessage();
})()

/**
 * Processes a message and sends emails when finished
 * @param {object} params 
 */
async function processMessage(params) {
    const s3 = new AWS.S3();
    const email = nodemailer.createTransport({
        SES: new AWS.SES()
    });

    try {
        logger.info(`Processing: ${JSON.stringify(params, null, 2)}`);
        const results = await calculate(params);

        logger.info(`Uploading file(s) to S3: ${outputS3Key}`);
        await s3.putObject({
            Body: JSON.stringify(results),
            Bucket: config.s3.bucket,
            Key: `${config.s3.prefix}${params.id}/results.json`,
        }).promise();

        // upload any generated results files, if available
        for (let file of results.files) {
            let filename = path.basename(file);
            await s3.putObject({
                Body: await fs.readFile(file),
                Bucket: config.s3.bucket,
                Key: `${config.s3.prefix}${params.id}/${filename}`,
            }).promise();
        }

        // specify template variables
        const templateData = {
            originalTimestamp: new Date(params.originalTimestamp).toLocaleString(),
            resultsUrl: `${config.rootUrl}/calculate/${params.id}`,
        };

        // send user success email
        logger.info(`Sending user success email`);
        const userEmailResults = await email.sendMail({
            from: config.email.sender,
            to: params.email,
            subject: 'Results',
            html: await readTemplate(__dirname + '/templates/user-success-email.html', templateData),
        });
        return true;
    } catch (e) {
        // catch exceptions related to conversion (assume s3/ses configuration is valid)
        logger.error(e);

        // template variables
        const templateData = {
            id: params.id,
            parameters: JSON.stringify(params, null, 4),
            originalTimestamp: new Date(params.originalTimestamp).toLocaleString(),
            exception: e.toString(),
            supportEmail: config.email.admin,
        };

        // send admin error email
        logger.info(`Sending admin error email`);
        const adminEmailResults = await email.sendMail({
            from: config.email.sender,
            to: config.email.admin,
            subject: `Error: ${params.id}`, // searchable calculation error subject
            html: await readTemplate(__dirname + '/templates/admin-failure-email.html', templateData),
        });

        // send user error email
        logger.info(`Sending user error email`);
        const userEmailResults = await email.sendMail({
            from: config.email.sender,
            to: params.email,
            subject: 'Error',
            html: await readTemplate(__dirname + '/templates/user-failure-email.html', templateData),
        });

        return false;
    }
}

/**
 * Reads a template, substituting {tokens} with data values
 * @param {string} filepath 
 * @param {object} data 
 */
async function readTemplate(filePath, data) {
    const template = await fs.readFile(path.resolve(filePath));
  
    // replace {tokens} with data values or removes them if not found
    return String(template).replace(
      /{[^{}]+}/g,
      key => data[key.replace(/[{}]+/g, '')] || ''
    );
}

/**
 * Receives messages from the queue at regular intervals,
 * specified by config.pollInterval
 */
async function receiveMessage() {
    const sqs = new AWS.SQS();

    try {
        // to simplify running multiple workers in parallel, 
        // fetch one message at a time
        const data = await sqs.receiveMessage({
            QueueUrl: config.queue.url,
            VisibilityTimeout: config.queue.visibilityTimeout,
            MaxNumberOfMessages: 1
        }).promise();

        if (data.Messages && data.Messages.length > 0) {
            const message = data.Messages[0];
            const params = JSON.parse(message.Body);

            // while processing is not complete, update the message's visibilityTimeout
            const intervalId = setInterval(_ => sqs.changeMessageVisibility({
                QueueUrl: config.queue.url,
                ReceiptHandle: message.ReceiptHandle,
                VisibilityTimeout: config.queue.visibilityTimeout
            }), 1000 * 60);

            // processMessage should return a boolean status indicating success or failure
            const status = await processMessage(params);
            clearInterval(intervalId);
            
            // if message was not processed successfully, send it to the
            // error queue (add metadata in future if needed)
            if (!status) {
                await sqs.sendMessage({
                    QueueUrl: config.queue.errorUrl,
                    MessageBody: JSON.stringify(params),
                }).promise();
            }

            // remove original message from queue once processed
            await sqs.deleteMessage({
                QueueUrl: config.queue.url,
                ReceiptHandle: message.ReceiptHandle
            }).promise();
        }
    } catch (e) {
        // catch exceptions related to sqs
        logger.error(e);
    } finally {
        // schedule receiving next message
        setTimeout(receiveMessage, config.queue.pollInterval);
    }
}

