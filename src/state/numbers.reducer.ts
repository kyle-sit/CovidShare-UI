/**
 * Example store file to follow
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type NumberState = number[];

const initialState: NumberState = [];
const numbers = createSlice({
    name: 'numbers',
    initialState,
    reducers: {
        setNumbers(state, { payload }: PayloadAction<number[]>) {
            return payload;
        },
    },
});

export const { setNumbers } = numbers.actions;
export default numbers.reducer;
