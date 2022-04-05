/**
 * This file creates and exports the Redux store for the application
 */
import { combineReducers } from 'redux';
import { configureStore } from '@reduxjs/toolkit';

import numbers, { NumberState } from './state/numbers.reducer';
import strings, { StringState } from './state/strings.reducer';

export interface AppState {
    numbers: NumberState;
    strings: StringState;
}

const reducer = combineReducers({
    numbers,
    strings,
});

const store = configureStore({ reducer });

export default store;
