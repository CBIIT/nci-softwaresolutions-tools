const { createProxyMiddleware } = require("http-proxy-middleware");
const package = require("../package.json");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: package.proxy,
    })
  );
};
