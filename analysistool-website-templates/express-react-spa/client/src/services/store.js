import { createSlice, configureStore, combineReducers } from '@reduxjs/toolkit';

export const getInitialState = () => ({
    input: {
        a: '',
        b: '',
        c: ''
    },
    calculate: {
        results: {},
        messages: [],
        loading: false,
    }
});

/*
*   Create slices for each store.
*   Each slice includes reducers and actions for each store
*/

const inputSlice = createSlice({
    name: 'input',
    initialState: getInitialState().input,
    reducers: {
        updateInput: (state, action) => {
            return {
                ...state,
                ...action.payload
            };
        },
    },
});

const calculateSlice = createSlice({
    name: 'calculate',
    initialState: getInitialState().calculate,
    reducers: {
        updateCalculate: (state, action) => {
            return {
                ...state,
                ...action.payload
            };
        },
    },
});

/* Combine reducers into a single one */
const rootReducer = combineReducers({
    input: inputSlice.reducer,
    calculate: calculateSlice.reducer
})

/* Export the combined store and setter functions*/
export const store = configureStore({
    reducer: rootReducer,
    preloadedState: getInitialState(),
});


const {updateInput} = inputSlice.actions;
const {updateCalculate} = calculateSlice.actions;

export function dispatchInput(obj) {
    store.dispatch(updateInput(obj));
}

export function dispatchCalculate(obj) {
    store.dispatch(updateCalculate(obj))
}