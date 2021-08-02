const { createProxyMiddleware } = require("http-proxy-middleware");
const { port } = require("../../server/config");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: `http://localhost:${port}`,
      changeOrigin: true,
    }),
  );
};
