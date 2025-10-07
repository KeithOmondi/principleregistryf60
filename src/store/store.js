import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import recordReducer from "./slices/recordsSlice";
import adminReducer from "./slices/adminSlice"
import courtSlice from "./slices/courtSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    records: recordReducer,
    admin: adminReducer,
    courts: courtSlice
  },
  
});
