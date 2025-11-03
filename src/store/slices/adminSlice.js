// src/store/slices/adminSlice.jsx
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// ==================== THUNKS ====================

// Fetch overall, weekly, and monthly stats for admin dashboard
export const fetchAdminStats = createAsyncThunk(
  "admin/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/records/dashboard-stats");
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
      const res = await api.get("/records/recent");
      return res.data.recentRecords || [];
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch recent records"
      );
    }
  }
);

// Download monthly report (CSV)
export const downloadMonthlyReport = createAsyncThunk(
  "admin/downloadMonthlyReport",
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const res = await api.get(
        `/records/monthly-report?month=${month}&year=${year}`,
        {
          responseType: "blob",
        }
      );

      // Trigger download
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Monthly_Report_${month}-${year}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      return { success: true };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to download report"
      );
    }
  }
);

// ==================== SLICE ====================

const initialState = {
  totalRecords: 0,
  approved: 0,
  rejected: 0,
  weekly: [],
  monthly: [],
  recentRecords: [],
  loading: false,
  error: null,
  reportDownloading: false,
  reportError: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
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
        state.rejected = rejected || 0;
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

    // Download Monthly Report
    builder
      .addCase(downloadMonthlyReport.pending, (state) => {
        state.reportDownloading = true;
        state.reportError = null;
      })
      .addCase(downloadMonthlyReport.fulfilled, (state) => {
        state.reportDownloading = false;
      })
      .addCase(downloadMonthlyReport.rejected, (state, action) => {
        state.reportDownloading = false;
        state.reportError = action.payload;
      });
  },
});

export default adminSlice.reducer;
