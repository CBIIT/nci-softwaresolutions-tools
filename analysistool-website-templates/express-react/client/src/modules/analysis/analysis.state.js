import { atom } from "recoil";

export const formValuesState = atom({
  key: "analysis.formValuesState",
  default: {
    sampleInput: "",
  },
});

export const loadingState = atom({
  key: "analysis.loadingState",
  default: false,
});

export const resultsState = atom({
  key: "analysis.resultsState",
  default: null,
});
