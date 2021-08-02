import { createSlice } from "@reduxjs/toolkit";

export const defaultFormValues = {
  sampleInput: "",
};

export const formValuesState = createSlice({
  name: "formValues",
  initialState: defaultFormValues,
  reducers: {
    setFormValues: (state, action) => action.payload,
    mergeFormValues: (state, action) => ({ ...state, ...action.payload }),
    resetFormValues: () => defaultFormValues,
  },
});

export const defaultResults = {};

export const resultsState = createSlice({
  name: "results",
  initialState: defaultResults,
  reducers: {
    setResults: (state, action) => action.payload,
    resetResults: () => defaultResults,
  },
});
