const express = require("express");
const request = require("supertest");
const { api } = require("../services/api");
let app = null;

beforeEach(() => {
  app = express();
  app.use("/api", api);
});

test("api is defined", () => {
  expect(api).toBeDefined();
});

test("GET api/ping returns true", async () => {
  const response = await request(app).get("/api/ping");
  expect(response.body).toBe(true);
});

test("POST api/submit returns params", async () => {
  const params = { test: 1 };
  const response = await request(app).post("/api/submit").send(params);
  expect(response.body.params).toStrictEqual(params);
});
