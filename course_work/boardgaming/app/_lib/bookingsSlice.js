import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    bookings: [],
    bookingIsLoading: false,
    bookingError: null, 
};

const bookingSlice = createSlice({
    name: "booking",
    initialState,
    reducers: {
        setBookings: (state, action) => {
            state.bookings = action.payload; 
        },
        setLoading: (state, action) => {
            state.bookingIsLoading = action.payload; 
        },
        setError: (state, action) => {
            state.bookingError = action.payload; 
        },
        resetBookings: (state, action) => {
            state.bookings = [];
        }
    },
});

export const { setBookings, setLoading, setError, resetBookings } = bookingSlice.actions;

export default bookingSlice.reducer;

export function checkBookings(user) {
    return async (dispatch) => {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));

            const res = await fetch("http://localhost:3001/bookings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: user.email,
                    userId: user.userId,
                }),
            });

            if(!res.ok)throw new Error("Something went wrong with fetching bookings");
            const data = await res.json();

            dispatch(setBookings(data.bookings));
        }catch (error) {
            dispatch(setError(error.message));
        } finally {
            dispatch(setLoading(false));
        }
    };
};

export function checkAdminBookings(email, userId, year) {
    return async (dispatch) => {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));
    
            const res = await fetch("http://localhost:3001/bookings_admin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    userId,
                    year,
                }),
            });
            if (!res.ok) throw new Error("Something went wrong with fetching bookings");
    
            const data = await res.json();
            dispatch(setBookings(data.bookings));
        } catch (error) {
            dispatch(setError(error.message));
        } finally {
            dispatch(setLoading(false));
        }
    };
};

export function createBooking(email, userId, date, time, period, game, players,) {
    return async (dispatch) => {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));

            const res = await fetch("http://localhost:3001/create_booking", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    userId,
                    date,
                    time,
                    period,
                    game,
                    players,
                }),
            });

            if(!res.ok)throw new Error("Something went wrong with fetching bookings");

        }catch (error) {
            dispatch(setError(error.message));
        } finally {
            dispatch(setLoading(false));
        }
    };
};

export function deleteBooking(email, userId, id) {
    return async (dispatch) => {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));

            const res = await fetch("http://localhost:3001/booking_delete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: id,
                    email,
                    userId,
                }),
            });

            if(!res.ok)throw new Error("Something went wrong with fetching bookings");
            const data = await res.json();
            dispatch(checkAdminBookings());
        }catch (error) {
            dispatch(setError(error.message));
        } finally {
            dispatch(setLoading(false));
        }
    };
}