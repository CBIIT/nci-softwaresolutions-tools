const express = require("express");
const logger = require("./services/logger");
const config = require("./config.json");

const app = express();

// register middleware
app.use(express.static(config.server.client));
app.use(express.json());

// sample submission route
app.post("/api/submit", (request, response) => {
  const { body } = request;
  const a = parseFloat(body.a);
  const b = parseFloat(body.b);

  response.json({
    sum: a + b,
    difference: a - b,
    product: a * b,
    quotient: a / b,
  });
});

// global error handler
app.use((error, request, response, next) => {
  const { name, message, stack } = error;
  logger.error({ message, stack });
  response.status(500).json(`${name}: ${message}`);
});

app.listen(config.server.port, () => {
  logger.info(`Application is running on port: ${config.server.port}`);
});
