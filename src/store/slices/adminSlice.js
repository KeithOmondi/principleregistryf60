import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const ADMIN_API = "https://principle-registry.onrender.com/api/v1/records";

// ==================== THUNKS ====================

// Fetch overall, weekly, and monthly stats for admin dashboard
export const fetchAdminStats = createAsyncThunk(
  "admin/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${ADMIN_API}/dashboard-stats`, {
        withCredentials: true,
      });
      // Backend returns: { success, totalRecords, approved, rejected, weekly, monthly }
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch admin stats"
      );
    }
  }
);

// Fetch recent records for the table
export const fetchRecentRecords = createAsyncThunk(
  "admin/fetchRecentRecords",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${ADMIN_API}/recent`, {
        withCredentials: true,
      });
      // Backend returns: { success, records: [...] }
      return res.data.records;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch recent records"
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
    weekly: [],
    monthly: [],
    recentRecords: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // Fetch Admin Stats
    builder
      .addCase(fetchAdminStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.loading = false;

        const { totalRecords, approved, rejected, weekly, monthly } =
          action.payload;

        state.totalRecords = totalRecords || 0;
        state.approved = approved || 0;
        state.pending = rejected || 0; // 🔑 mapping "rejected" to "pending"
        state.weekly = weekly || [];
        state.monthly = monthly || [];
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Recent Records
    builder
      .addCase(fetchRecentRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.recentRecords = action.payload || [];
      })
      .addCase(fetchRecentRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default adminSlice.reducer;
