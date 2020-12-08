import { createSlice } from '@reduxjs/toolkit';
import { mergeObject } from './utils';

export const getInitialState = () => ({
    a: '',
    b: '',
});

export const { actions, reducer } = createSlice({
    name: 'params',
    initialState: getInitialState(),
    reducers: {
        mergeParams: mergeObject,
        resetParams: getInitialState,
    }
});