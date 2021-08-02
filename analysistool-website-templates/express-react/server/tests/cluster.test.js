const cluster = require("cluster");
const { forkCluster } = require("../services/cluster");

jest.mock("cluster");

test("forkCluster() returns an array of workers when called from the primary process", async () => {
  cluster.isPrimary = true;
  const numWorkers = 2;
  const result = forkCluster(numWorkers);
  expect(result.length).toBe(numWorkers);
});

test("forkCluster() returns false when called from a worker process", async () => {
  cluster.isWorker = true;
  const numWorkers = 2;
  const result = forkCluster(numWorkers);
  expect(result).toBe(false);
});
