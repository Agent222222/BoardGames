import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    games: [],
    isLoading: false,
    error: null, 
};

const gameSlice = createSlice({
    name: "game",
    initialState,
    reducers: {
        setGames: (state, action) => {
            state.games = action.payload; 
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload; 
        },
        setError: (state, action) => {
            state.error = action.payload; 
        },
    },
});

export const { setGames, setLoading, setError } = gameSlice.actions;

export default gameSlice.reducer;

export function getGames() {
    return async (dispatch) => {
        try {
            dispatch(setLoading(true)); 
            dispatch(setError(null));
            const res = await fetch("http://localhost:3001/games"); // Fetch the games data from backend
            const data = await res.json(); 
    
            // Dispatch action to set games in the Redux state
            dispatch(setGames(data));
        } catch (error) {
            // If there's an error, dispatch the error message
            dispatch(setError("Error fetching games"));
        } finally {
            dispatch(setLoading(false)); // Set loading to false after the fetch
        }
    };
}

export function createGame(email, userId, game_name, players, goal, rules) {
    return async (dispatch) => {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));

            const res = await fetch("http://localhost:3001/game_create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    userId,
                    game_name,
                    status: "new",
                    players,
                    goal,
                    rules,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to create game.");
            }

            const data = await res.json();
            dispatch(getGames());
        } catch (error) {
            dispatch(setError(error.message));
        } finally {
            dispatch(setLoading(false));
        }
    };
}

export function deleteGame(email, userId, id) {
    return async (dispatch) => {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));

            const res = await fetch("http://localhost:3001/game_delete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    userId,
                    game_id: id,
                }),
            });

            if(!res.ok)throw new Error("Something went wrong with fetching bookings");
            const data = await res.json();

            dispatch(getGames());
        }catch (error) {
            dispatch(setError(error.message));
        } finally {
            dispatch(setLoading(false));
        }
    };
}