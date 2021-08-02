const { checkStatus } = require("../services/utils");

test("checkStatus() returns true", async () => {
  const result = await checkStatus();
  expect(result).toBe(true);
});
