const express = require("express");
const { logRequests, logErrors } = require("./services/middleware");
const { getLogger } = require("./services/logger");
const { forkCluster } = require("./services/cluster");
const { api } = require("./services/api");
const { name, port, logs } = require("./config");

// if in master process, fork and return
if (forkCluster()) return;

// if in child process, create express application
const app = express();

// if behind a proxy, use the first x-forwarded-for address as the client's ip address
app.set("trust proxy", true);

// create and register logger
const logger = getLogger(name, logs);
app.locals.logger = logger;

// register middleware
app.use(logRequests());
app.use("/api", api);
app.use(logErrors());

// start app on specified port
app.listen(port, () => {
  logger.info(`${name} started on port ${port}`);
});

module.exports = app;
