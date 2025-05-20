import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    payments: [],
    isLoading: false,
    error: null, 
};

const paymentSlice = createSlice({
    name: "payment",
    initialState,
    reducers: {
        setPayments: (state, action) => {
            state.payments = action.payload; 
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload; 
        },
        setError: (state, action) => {
            state.error = action.payload; 
        },
        resetPayments: (state, action) => {
            state.payments = [];
        }
    },
});

export const { setPayments, setLoading, setError, resetPayments } = paymentSlice.actions;

export default paymentSlice.reducer;

export function checkAllPayments(email, userId, year) {
    return async (dispatch) => {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));

            const res = await fetch("http://localhost:3001/checkAll_payments", {
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

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Payments check failed");

            dispatch(setPayments(data));
        } catch (error) {
            dispatch(setError(error.message));
        } finally {
            dispatch(setLoading(false));
        }
    };
}

export function updatePayment( email, userId, id, status, amount, card_or_cash ) {
    return async (dispatch) => {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));
    
            const res = await fetch("http://localhost:3001/update_payment", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                userId,
                payment_id: id,
                status,
                amount,
                card_or_cash,
            }),
            });
    
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Update failed");
    
            dispatch(checkAllPayments());
        } catch (error) {
            dispatch(setError(error.message));
        } finally {
            dispatch(setLoading(false));
        }
    };
}