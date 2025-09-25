// store/slices/adminSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const ADMIN_API = "https://principle-registry.onrender.com/api/v1/records";

// ==================== THUNK ====================

// Fetch stats for individual records
export const fetchAdminStats = createAsyncThunk(
  "admin/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${ADMIN_API}/stats`, {
        withCredentials: true,
      });
      return res.data; 
      // Backend returns: { success, stats: { overall, monthly, perCourt? } }
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch admin stats"
      );
    }
  }
);

// ==================== SLICE ====================

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    totalRecords: 0,
    approved: 0,
    pending: 0,

    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.loading = false;

        const overall = action.payload?.stats?.overall || {};

        state.totalRecords = overall.totalRecords || 0;
        state.approved = overall.approved || 0;
        state.pending = overall.rejected || 0; // 🔑 mapping backend's "rejected" to frontend's "pending"
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default adminSlice.reducer;
