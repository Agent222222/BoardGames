import { configureStore } from "@reduxjs/toolkit"

import gameReducer from "../_lib/gameSlice.js";
import tableReducer from "../_lib/tableSlice.js";
import accountReducer from "../_lib/accountSlice.js";
import bookingReducer from "../_lib/bookingsSlice.js";
import paymentReducer from "../_lib/paymentsSlice.js";
import matchReducer from "../_lib/matchesSlice.js";

const store = configureStore({
    reducer: {
        game: gameReducer,
        tables: tableReducer,
        account: accountReducer,
        bookings: bookingReducer,
        payments: paymentReducer,
        matches: matchReducer,
    }
});

export default store;