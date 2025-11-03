// src/store/slices/courtSlice.jsx
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

/* ==========================
   INITIAL STATE
========================== */
const initialState = {
  list: [],
  loading: false,
  error: null,
};

/* ==========================
   ASYNC THUNKS
========================== */

// Fetch all courts
export const fetchCourts = createAsyncThunk(
  "courts/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/courts/all");
      return res.data.data || res.data.courts || [];
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "❌ Failed to fetch courts"
      );
    }
  }
);

// Create a new court
export const createCourt = createAsyncThunk(
  "courts/create",
  async (court, { rejectWithValue }) => {
    try {
      const res = await api.post("/courts/create", court);
      return res.data.data || res.data.court;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "❌ Failed to create court"
      );
    }
  }
);

/* ==========================
   SLICE
========================== */
const courtSlice = createSlice({
  name: "courts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch courts
      .addCase(fetchCourts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourts.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchCourts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "❌ Failed to load courts";
      })

      // create court
      .addCase(createCourt.pending, (state) => {
        state.error = null;
      })
      .addCase(createCourt.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(createCourt.rejected, (state, action) => {
        state.error = action.payload || "❌ Failed to create court";
      });
  },
});

/* ==========================
   EXPORT
========================== */
export default courtSlice.reducer;
