import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import recordReducer from "./slices/recordsSlice";
import bulkReducer from "./slices/bulkSlice"
import adminReducer from "./slices/adminSlice"
import matchReducer from "./slices/matchSlice"
import courtSlice from "./slices/courtSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    records: recordReducer,
    bulk: bulkReducer,
    admin: adminReducer,
    match: matchReducer,
    courts: courtSlice
  },
  
});
