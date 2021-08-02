const { formatLog, getLogger } = require("../services/logger");

test("getLogger() returns a logger", () => {
  const result = getLogger("test");
  expect(result).toBeDefined();
});

test("formatLog() returns a formatted string", () => {
  const result = formatLog({
    label: "test label",
    timestamp: 0,
    level: "info",
    message: "test message",
  });

  expect(result).toMatch(/\[test label\] \[\d+\] \[0\] \[info\] test message/);
});
