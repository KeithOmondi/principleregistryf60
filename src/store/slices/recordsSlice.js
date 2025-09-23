import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const RECORD_API = "https://principle-registry.onrender.com/api/v1/records";

/* ------------------------- ASYNC THUNKS ------------------------- */

export const fetchRecords = createAsyncThunk(
  "records/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${RECORD_API}/user-records`);
      return res.data; // { records, currentPage, totalPages, totalRecords }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch records");
    }
  }
);

export const fetchAllRecordsForAdmin = createAsyncThunk(
  "records/fetchAllAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${RECORD_API}/admin`, { withCredentials: true });
      return res.data.records;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch admin records");
    }
  }
);

export const addRecord = createAsyncThunk(
  "records/add",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${RECORD_API}/create`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to add record");
    }
  }
);

export const bulkUploadRecords = createAsyncThunk(
  "records/bulkUpload",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${RECORD_API}/bulk-upload`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to bulk upload records");
    }
  }
);

export const updateRecord = createAsyncThunk(
  "records/update",
  async ({ id, recordData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${RECORD_API}/update/${id}`, recordData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update record");
    }
  }
);

export const deleteRecord = createAsyncThunk(
  "records/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${RECORD_API}/delete/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete record");
    }
  }
);

/* ------------------------- SLICE ------------------------- */

const recordsSlice = createSlice({
  name: "records",
  initialState: {
    records: [],
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    selectedRecord: null,
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    clearSelectedRecord: (state) => {
      state.selectedRecord = null;
    },
    resetRecordState: (state) => {
      state.loading = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch records (user)
      .addCase(fetchRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload.records;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.totalRecords = action.payload.totalRecords;
      })
      .addCase(fetchRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch all records (admin)
      .addCase(fetchAllRecordsForAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllRecordsForAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchAllRecordsForAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add record
      .addCase(addRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.records.unshift(action.payload);
        state.message = "✅ Record added successfully";
      })
      .addCase(addRecord.rejected, (state, action) => {
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
        state.message = action.payload.message || "✅ Bulk upload successful";
        if (action.payload.records) {
          state.records = [...action.payload.records, ...state.records];
        }
      })
      .addCase(bulkUploadRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update record
      .addCase(updateRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.records = state.records.map((r) =>
          r._id === action.payload._id ? action.payload : r
        );
        state.message = "✅ Record updated successfully";
      })
      .addCase(updateRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete record
      .addCase(deleteRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.records = state.records.filter((r) => r._id !== action.payload);
        state.message = "🗑️ Record deleted successfully";
      })
      .addCase(deleteRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedRecord, resetRecordState } = recordsSlice.actions;
export default recordsSlice.reducer;
