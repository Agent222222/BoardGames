import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    tables: [],
    isLoading: false,
    error: null, 
};

const tableSlice = createSlice({
    name: "account",
    initialState,
    reducers: {
        setTables: (state, action) => {
            state.tables = action.payload; 
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload; 
        },
        setError: (state, action) => {
            state.error = action.payload; 
        },
        resetTables: (state, action) => {
            state.tables = [];
        }
    },
});

export const { setTables, setLoading, setError, resetTables } = tableSlice.actions;

export default tableSlice.reducer;

export function getTables(email, userId) {
    return async (dispatch) => {
        try {
            dispatch(setLoading(true)); 
            dispatch(setError(null));
            const res = await fetch("http://localhost:3001/tables", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    userId,
                }),
            });
            const data = await res.json(); 

            dispatch(setTables(data));
        } catch (error) {
            dispatch(setError("Error fetching games"));
        } finally {
            dispatch(setLoading(false));
        }
    };
}

