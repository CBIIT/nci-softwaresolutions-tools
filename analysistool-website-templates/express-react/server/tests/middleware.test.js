const { formatRequest, logErrors, logRequests, withAsync } = require("../services/middleware");

test("formatRequest() returns a formatted string", () => {
  const result = formatRequest(getMockRequest(), getMockResponse());
  expect(result).toBe(`0.0.0.0 GET / HTTP/1.1 200 0 0 0ms "test-referrer" "jest-user-agent"`);
});

test("formatRequest() returns a formatted string when given no referrer or user-agent", () => {
  const result = formatRequest(getMockRequest({ "referrer": null, "user-agent": null }), getMockResponse());
  expect(result).toBe(`0.0.0.0 GET / HTTP/1.1 200 0 0 0ms "No Referrer" "No User-Agent"`);
});

test("logErrors() returns a middleware function", () => {
  const result = logErrors();
  expect(typeof result).toBe("function");
});

test("logErrors() middleware correctly processes a request", () => {
  const testLogErrors = jest.fn(() => {
    const middleware = logErrors();
    middleware(new Error(), getMockRequest(), getMockResponse());
  });

  testLogErrors();
  expect(testLogErrors).toHaveReturned();
});

test("logRequests() returns a middleware function", () => {
  const result = logRequests();
  expect(typeof result).toBe("function");
});

test("logRequests() middleware correctly processes a request", () => {
  const next = jest.fn();
  const middleware = logRequests();
  middleware(getMockRequest(), getMockResponse(), next);
  expect(next).toHaveBeenCalled();
});

test("withAsync() returns a middleware function", () => {
  const result = withAsync();
  expect(typeof result).toBe("function");
});

test("withAsync() correctly processes a request", () => {
  const next = jest.fn();
  const handler = jest.fn((request, response, next) => true);
  const middleware = withAsync(handler);
  middleware(getMockRequest(), getMockResponse(), next);
  expect(handler).toHaveBeenCalled();
  expect(next).toHaveBeenCalledTimes(0);
});

test("withAsync() correctly processes an error", () => {
  const expectedError = new Error();
  const next = jest.fn();
  const handler = jest.fn((request, response, next) => {
    throw expectedError;
  });
  const middleware = withAsync(handler);
  middleware(getMockRequest(), getMockResponse(), next);
  expect(handler).toHaveBeenCalled();
  expect(next).toHaveBeenCalledWith(expectedError);
});

function getMockRequest(headers) {
  return {
    _startTime: 0n,
    ip: "0.0.0.0",
    method: "GET",
    path: "/",
    httpVersionMajor: 1,
    httpVersionMinor: 1,
    get: (key) =>
      ({
        "content-length": 0,
        "referrer": "test-referrer",
        "user-agent": "jest-user-agent",
        ...headers,
      }[key]),
    app: {
      locals: {
        logger: {
          info: () => {},
          error: () => {},
        },
      },
    },
  };
}

function getMockResponse(headers) {
  return {
    _endTime: 0n,
    statusCode: 200,
    get: (key) =>
      ({
        "content-length": 0,
        ...headers,
      }[key]),
    on: (eventName, callback) => {
      callback();
    },
    status: (statusCode) => ({
      json: (value) => {},
    }),
  };
}
