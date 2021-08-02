const { formatRequest, logErrors, logRequests, withAsync } = require("../services/middleware");

test("formatRequest() returns a formatted string", () => {
  const result = formatRequest(getMockRequest(), getMockResponse());
  expect(result).toBe(`0.0.0.0 GET / HTTP/1.1 200 0 0 0ms "test-referrer" "jest-user-agent"`);
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
  const fn = jest.fn((req, res, next) => true);
  const middleware = withAsync(fn);
  middleware(getMockRequest(), getMockResponse(), next);
  expect(fn).toHaveBeenCalled();
});

test("withAsync() correctly processes an error", () => {
  const expectedError = new Error();
  const next = jest.fn();
  const fn = (req, res, next) => {
    throw expectedError;
  };
  const middleware = withAsync(fn);
  middleware(getMockRequest(), getMockResponse(), next);
  expect(next).toHaveBeenCalledWith(expectedError);
});

function getMockRequest() {
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

function getMockResponse() {
  return {
    _endTime: 0n,
    statusCode: 200,
    get: (key) =>
      ({
        "content-length": 0,
      }[key]),
    on: (eventName, callback) => {
      callback();
    },
    status: (statusCode) => ({
      json: (value) => {},
    }),
  };
}
