/**
 * This file contains React Hooks for conveniently accessing values in the Redux store.
 * Often we want to access several values at once, so we can compose existing hooks
 * into one to access these values.
 */

// import * as React from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { AppState } from '../store';
import { setNumbers } from './numbers.reducer';
import { setStrings } from './strings.reducer';

/**
 * Returns as tuple:
 * * numbers is the redux number state
 * * strings is the redux string state
 * * dispatchSetNumbers is a function that takes in a number array and sets the number state to it
 * * dispatchSetStrings is a function that takes in a string array and sets the string state to it
 */
export function useNumbersAndStrings() {
    const dispatch = useDispatch();

    const numbers = useSelector((state: AppState) => state.numbers);
    const strings = useSelector((state: AppState) => state.strings);

    const dispatchSetNumbers = (numbers: number[]) => {
        dispatch(setNumbers(numbers));
    };
    const dispatchSetStrings = (strings: string[]) => {
        dispatch(setStrings(strings));
    };

    return [numbers, strings, dispatchSetNumbers, dispatchSetStrings] as const;
}
