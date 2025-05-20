import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    matches: [],
    isLoading: false,
    error: null, 
};

const matchSlice = createSlice({
    name: "match",
    initialState,
    reducers: {
        setMatches: (state, action) => {
            state.matches = action.payload; 
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload; 
        },
        setError: (state, action) => {
            state.error = action.payload; 
        },
    },
});

export const { setMatches, setLoading, setError } = matchSlice.actions;

export default matchSlice.reducer;

export function getMatches() {
    return async (dispatch) => {
        try {
            dispatch(setLoading(true)); 
            dispatch(setError(null));
            const res = await fetch("http://localhost:3001/matches"); // Fetch the games data from backend
            const data = await res.json(); 
    
            dispatch(setMatches(data));
        } catch (error) {
            dispatch(setError("Error fetching matches"));
        } finally {
            dispatch(setLoading(false)); 
        }
    };
}

export function createMatch(email, userId, playerCount, players, winner, date, time, stage) {
    return async (dispatch) => {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));

            const res = await fetch("http://localhost:3001/match_create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    userId,
                    playerCount,
                    players,
                    winner,
                    date,
                    time,
                    stage,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to create game.");
            }

            const data = await res.json();
            //dispatch(getMatches());
        } catch (error) {
            dispatch(setError(error.message));
        } finally {
            dispatch(setLoading(false));
        }
    };
}

