import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: {
        userId: "",
        email: "",
        name: "",
        phone: 0,
        password: "",
        access: "",
    },
    isLoading: false,
    error: null, 
};

const accountSlice = createSlice({
    name: "account",
    initialState,
    reducers: {
        setAccount: (state, action) => {
            state.user = action.payload; 
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload; 
        },
        setError: (state, action) => {
            state.error = action.payload; 
        },
        resetAccount: (state, action) => {
            state.user = {};
        }
    },
});

export const { setAccount, setLoading, setError, resetAccount } = accountSlice.actions;

export default accountSlice.reducer;

export function Register(user) {
    return async (dispatch) => {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));

            const res = await fetch("http://localhost:3001/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(user),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Registration failed");
        } catch (error) {
            dispatch(setError(error.message));
        } finally {
            dispatch(setLoading(false));
        }
    };
}

export function Login(user) {
    return async (dispatch) => {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));

            const res = await fetch("http://localhost:3001/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(user),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Login failed");
            const transformedUser = {
                userId: data.userId,
                email: data.email || data.player_email,
                name: data.name || "",
                phone: data.phone || 0,
                password: user.password, 
                access: data.access || "",
            };

            console.log(transformedUser);

            dispatch(setAccount(transformedUser));
        } catch (error) {
            dispatch(setError(error.message));
        } finally {
            dispatch(setLoading(false));
        }
    };
}

export function userLogout(user) {
    return async (dispatch) => {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));

            const res = await fetch("http://localhost:3001/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(user),
            });

            const data = await res.json();
            dispatch(resetAccount());
        } catch (error) {
            dispatch(setError(error.message));
        } finally {
            dispatch(setLoading(false));
        }
    };
}

export function updateUser( name, phone, password ) {
    return async (dispatch, getState) => {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));

            console.log(name, phone, password);
    
            const { account: { user } } = getState();
    
            const res = await fetch("http://localhost:3001/update_user", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: user.email,
                userId: user.userId,
                name,
                phone,
                password,
            }),
            });
    
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Update failed");
    
            dispatch(setAccount({
            ...user,
            name: name,
            phone: phone,
            password: password,
            }));
        } catch (error) {
            dispatch(setError(error.message));
        } finally {
            dispatch(setLoading(false));
        }
    };
}
