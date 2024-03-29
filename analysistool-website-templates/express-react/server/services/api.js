const { Router, json } = require("express");
const { withAsync } = require("./middleware");
const { checkStatus } = require("./utils");

const api = Router();
api.use(json());

api.get(
  "/ping",
  withAsync(async (request, response) => {
    const status = await checkStatus(request);
    response.json(status);
  }),
);

api.post("/submit", (request, response) => {
  const params = request.body;
  response.json({ params });
});

module.exports = { api };
