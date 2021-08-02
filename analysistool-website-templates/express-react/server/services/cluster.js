const cluster = require("cluster");
const numCPUs = require("os").cpus().length;

function forkCluster(numProcesses = numCPUs) {
  if (cluster.isWorker) {
    return false;
  }

  let workers = [];

  for (let i = 0; i < numProcesses; i++) {
    workers.push(cluster.fork());
  }

  return workers;
}

module.exports = { forkCluster };
