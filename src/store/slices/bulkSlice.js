import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BULK_API = "http://localhost:8000/api/v1/bulk";

// Fetch all bulk records
export const fetchBulkRecords = createAsyncThunk(
  "bulk/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BULK_API}/records`, { withCredentials: true });
      return res.data.records || []; // safe fallback
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch bulk records");
    }
  }
);

// Bulk upload
export const bulkUploadRecords = createAsyncThunk(
  "bulk/upload",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BULK_API}/bulk-upload`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.records || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to upload bulk records");
    }
  }
);

const bulkSlice = createSlice({
  name: "bulk",
  initialState: {
    records: [],
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    resetBulkState: (state) => {
      state.loading = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all bulk records
      .addCase(fetchBulkRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBulkRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchBulkRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Bulk upload
      .addCase(bulkUploadRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkUploadRecords.fulfilled, (state, action) => {
        state.loading = false;
        // append new records instead of replacing
        state.records = [...state.records, ...action.payload];
        state.message = `${action.payload.length} records uploaded successfully`;
      })
      .addCase(bulkUploadRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetBulkState } = bulkSlice.actions;
export default bulkSlice.reducer;
