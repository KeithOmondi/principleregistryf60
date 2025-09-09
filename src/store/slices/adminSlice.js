// store/slices/adminSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const ADMIN_API = "http://localhost:8000/api/v1/records";
const BULK_API = "http://localhost:8000/api/v1/bulk";

// ==================== THUNKS ====================

// Fetch stats for individual records
export const fetchAdminStats = createAsyncThunk(
  "admin/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${ADMIN_API}/stats`, {
        withCredentials: true,
      });
      return res.data; // { totalRecords, approved, pending, recent }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch admin stats"
      );
    }
  }
);

// Fetch stats for bulk gazettes
export const fetchBulkStats = createAsyncThunk(
  "admin/fetchBulkStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BULK_API}/stats`, {
        withCredentials: true,
      });
      return res.data; 
      // Expected shape:
      // { totalCases, totalCourts, byVolume: { "123": 10, "124": 15 }, recentBulk: [ ... ] }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch bulk stats"
      );
    }
  }
);

// ==================== SLICE ====================

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    // record stats
    totalRecords: 0,
    approved: 0,
    pending: 0,
    recentRecords: [],

    // bulk stats
    totalCases: 0,
    totalCourts: 0,
    byVolume: {},
    recentBulk: [],

    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Records stats
      .addCase(fetchAdminStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.loading = false;
        state.totalRecords = action.payload.totalRecords;
        state.approved = action.payload.approved;
        state.pending = action.payload.pending;
        state.recentRecords = action.payload.recent || [];
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Bulk stats
      .addCase(fetchBulkStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBulkStats.fulfilled, (state, action) => {
        state.loading = false;
        state.totalCases = action.payload.totalCases;
        state.totalCourts = action.payload.totalCourts;
        state.byVolume = action.payload.byVolume || {};
        state.recentBulk = action.payload.recentBulk || [];
      })
      .addCase(fetchBulkStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default adminSlice.reducer;
