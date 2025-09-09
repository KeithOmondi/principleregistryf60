import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const REPORT_API = "http://localhost:8000/api/v1/bulk";

// Fetch report by date range
export const fetchBulkReport = createAsyncThunk(
  "bulkReport/fetch",
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${REPORT_API}/report`, {
        params: { startDate, endDate },
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch bulk report"
      );
    }
  }
);

const bulkReportSlice = createSlice({
  name: "bulkReport",
  initialState: {
    startDate: null,
    endDate: null,
    report: [],
    loading: false,
    error: null,
  },
  reducers: {
    resetReport: (state) => {
      state.startDate = null;
      state.endDate = null;
      state.report = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBulkReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBulkReport.fulfilled, (state, action) => {
        state.loading = false;
        state.startDate = action.payload.startDate;
        state.endDate = action.payload.endDate;
        state.report = action.payload.report;
      })
      .addCase(fetchBulkReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetReport } = bulkReportSlice.actions;
export default bulkReportSlice.reducer;
