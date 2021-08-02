const express = require("express");
const { api } = require("../services/api");

test("api is defined", () => {
  expect(api).toBeDefined();
});

test("api/ping returns true", async () => {
  const responseFn = jest.fn();
  const { handle } = api.stack[1];
  const request = { 
    url: "/ping", 
    method: "GET" 
  };
  const response = { 
    json: responseFn 
  };
  await handle(request, response);
  expect(responseFn).toHaveBeenCalledWith(true);
});
