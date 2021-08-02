import { configureStore } from '@reduxjs/toolkit';
import { formValuesState, resultsState } from '../modules/analysis/analysis.state';

export const store = configureStore({
  reducer: {
    formValues: formValuesState.reducer,
    results: resultsState.reducer,
  },
})