const express = require("express");
const { api } = require("../services/api");

test("api is defined", () => {
  expect(api).toBeDefined();
});

test("api/ping returns true", async () => {
  const responseFn = jest.fn();
  const { handle } = api.stack[-1];
  await handle({ url: "/ping", method: "GET" }, { json: responseFn });
  expect(responseFn).toHaveBeenCalledWith(true);
});
