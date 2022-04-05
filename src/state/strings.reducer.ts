/**
 * Example store file to follow
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type StringState = string[];

const initialState: StringState = [];
const strings = createSlice({
    name: 'strings',
    initialState,
    reducers: {
        setStrings(state, { payload }: PayloadAction<string[]>) {
            return payload;
        },
    },
});

export const { setStrings } = strings.actions;
export default strings.reducer;
