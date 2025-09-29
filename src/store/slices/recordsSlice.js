import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const RECORD_API = "https://principle-registry.onrender.com/api/v1/records";

// ✅ Helper to attach token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token"); // or from Redux state if you prefer
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/* ------------------------- ASYNC THUNKS ------------------------- */

// Fetch records (user)
export const fetchRecords = createAsyncThunk(
  "records/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${RECORD_API}/user-records`, {
        headers: getAuthHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "❌ Failed to fetch records");
    }
  }
);

// Fetch all records (admin)
export const fetchAllRecordsForAdmin = createAsyncThunk(
  "records/fetchAllAdmin",
  async ({ page = 1, limit = 30, search = "", court = "All", status = "All" }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${RECORD_API}/admin`, {
        params: { page, limit, search, court, status },
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "❌ Failed to fetch records");
    }
  }
);

// Add record
export const addRecord = createAsyncThunk(
  "records/add",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${RECORD_API}/create`, data, {
        headers: getAuthHeaders(),
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "❌ Failed to add record");
    }
  }
);

// Bulk upload
export const bulkUploadRecords = createAsyncThunk(
  "records/bulkUpload",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${RECORD_API}/bulk-upload`, formData, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "❌ Failed to bulk upload records");
    }
  }
);

// Update record
export const updateRecord = createAsyncThunk(
  "records/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${RECORD_API}/update/${id}`, data, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "❌ Failed to update record");
    }
  }
);

// Delete record
export const deleteRecord = createAsyncThunk(
  "records/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${RECORD_API}/delete/${id}`, {
        headers: getAuthHeaders(),
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "❌ Failed to delete record");
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
    pageSize: 30,
    selectedRecord: null,
    search: "",
    court: "All",
    status: "All",
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
    setFilters: (state, action) => {
      const { search, court, status } = action.payload;
      if (search !== undefined) state.search = search;
      if (court !== undefined) state.court = court;
      if (status !== undefined) state.status = status;
      state.currentPage = 1; // reset pagination when filters change
    },
    resetFilters: (state) => {
      state.search = "";
      state.court = "All";
      state.status = "All";
      state.currentPage = 1;
    },
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action) => {
      state.pageSize = action.payload;
      state.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ----------------- Fetch records (user) ----------------- */
      .addCase(fetchRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = Array.isArray(action.payload.records) ? action.payload.records : [];
        state.currentPage = Number(action.payload.currentPage) || 1;
        state.totalPages = Number(action.payload.totalPages) || 1;
        state.totalRecords = Number(action.payload.totalRecords) || 0;
        state.pageSize = Number(action.payload.pageSize) || state.pageSize;
      })
      .addCase(fetchRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ----------------- Fetch all records (admin) ----------------- */
      .addCase(fetchAllRecordsForAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllRecordsForAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.records = Array.isArray(action.payload.records) ? action.payload.records : [];
        state.currentPage = Number(action.payload.currentPage) || 1;
        state.totalPages = Number(action.payload.totalPages) || 1;
        state.totalRecords = Number(action.payload.totalRecords) || 0;
        state.pageSize =
          Number(action.payload.pageSize) ||
          Number(action.meta.arg?.limit) ||
          state.pageSize;
      })
      .addCase(fetchAllRecordsForAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ----------------- Add record ----------------- */
      .addCase(addRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.records.unshift(action.payload);
        state.totalRecords += 1;
        state.message = "✅ Record added successfully";
      })
      .addCase(addRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ----------------- Bulk upload ----------------- */
      .addCase(bulkUploadRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkUploadRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message || "✅ Bulk upload successful";
        if (Array.isArray(action.payload.records)) {
          state.records = [...action.payload.records, ...state.records];
          state.totalRecords += action.payload.records.length;
        }
      })
      .addCase(bulkUploadRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ----------------- Update record ----------------- */
      .addCase(updateRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.message = "✅ Record updated successfully";
        const index = state.records.findIndex((r) => r._id === action.payload._id);
        if (index !== -1) {
          state.records[index] = action.payload;
        }
      })
      .addCase(updateRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "❌ Failed to update record";
      })

      /* ----------------- Delete record ----------------- */
      .addCase(deleteRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.records = state.records.filter((r) => r._id !== action.payload);
        state.totalRecords = Math.max(0, state.totalRecords - 1);
        state.message = "🗑️ Record deleted successfully";
      })
      .addCase(deleteRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

/* ------------------------- EXPORTS ------------------------- */
export const {
  clearSelectedRecord,
  resetRecordState,
  setFilters,
  resetFilters,
  setPage,
  setPageSize,
} = recordsSlice.actions;

export default recordsSlice.reducer;
