/**
 * Formats an express request and response as a string
 * @param {Express.Request} request
 * @param {Express.Response} response
 * @returns string - A space-delimited record with quoted fields
 */
function formatRequest(request, response) {
  const httpVersion = `HTTP/${request.httpVersionMajor}.${request.httpVersionMinor}`;
  const duration = (response._endTime - request._startTime) / BigInt(1e6);
  const requestLength = request.get("content-length") || 0;
  const responseLength = response.get("content-length") || 0;
  const referrer = request.get("referrer") || "No Referrer";
  const userAgent = request.get("user-agent") || "No User-Agent";
  const quote = (el) => `"${el}"`;

  return [
    request.ip,
    request.method,
    request.path,
    httpVersion,
    response.statusCode,
    requestLength,
    responseLength,
    `${duration}ms`,
    quote(referrer),
    quote(userAgent),
  ]
    .filter((el) => el !== undefined)
    .join(" ");
}

/**
 * Creates a middleware function for logging requests
 * @param {function} formatter A function which formats a request and response as a string
 * @returns An express.js middleware function
 */
function logRequests(formatter = formatRequest) {
  return (request, response, next) => {
    const { logger } = request.app.locals;

    request._startTime = process.hrtime.bigint();
    response.on("finish", () => {
      response._endTime = process.hrtime.bigint();
      logger.info(formatter(request, response));
    });
    next();
  };
}

/**
 * Creates a middleware function for logging errors
 * @returns An express.js middleware function
 */
function logErrors() {
  return (error, request, response, next) => {
    const { logger } = request.app.locals;

    // return a custom error response
    response.status(500).json({
      error: error.name,
      message: error.message,
    });

    // defer logging until after the response has been sent
    response.on("finish", () => {
      logger.error(error);
    });
  };
}

/**
 * Wraps asynchronous functions to forward exceptions to
 * error-handling middleware.
 *
 * Note: This function is not needed in Express.js 5
 *
 * @param {function} fn - An asynchronous middleware function
 * @returns The middleware function decorated with an error handler
 */
function withAsync(fn) {
  return async (request, response, next) => {
    try {
      return await fn(request, response, next);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  formatRequest,
  logRequests,
  logErrors,
  withAsync,
};
