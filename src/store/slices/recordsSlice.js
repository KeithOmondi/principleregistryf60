// src/store/slices/recordsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

/* ============================================================
🔹 ASYNC THUNKS
============================================================ */

// 🧩 Fetch user-specific records
export const fetchRecords = createAsyncThunk(
  "records/fetchUserRecords",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/records/user-records");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "❌ Failed to fetch user records"
      );
    }
  }
);

// 🧩 Fetch all records (Admin)
export const fetchAllRecordsForAdmin = createAsyncThunk(
  "records/fetchAllRecordsForAdmin",
  async (
    { page = 1, limit = 30, search = "", court = "All", status = "All" },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.get("/records/admin", {
        params: { page, limit, search, court, status },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "❌ Failed to fetch admin records"
      );
    }
  }
);

// 🧩 Add a record
export const addRecord = createAsyncThunk(
  "records/addRecord",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/records/create", payload);
      return res.data.record || res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "❌ Failed to add record"
      );
    }
  }
);

// 🧩 Update a record
export const updateRecord = createAsyncThunk(
  "records/updateRecord",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/records/update/${id}`, data);
      return res.data.record || res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "❌ Failed to update record"
      );
    }
  }
);

// 🧩 Delete a record
export const deleteRecord = createAsyncThunk(
  "records/deleteRecord",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/records/delete/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "❌ Failed to delete record"
      );
    }
  }
);

// 🧩 Bulk update “Date Forwarded to G.P.”
export const updateMultipleRecordsDateForwarded = createAsyncThunk(
  "records/updateMultipleRecordsDateForwarded",
  async ({ ids, date }, { rejectWithValue }) => {
    try {
      const res = await api.patch("/records/bulk-update-forwarded", {
        ids,
        date,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "❌ Failed to update records"
      );
    }
  }
);

// 🧩 Dashboard stats (weekly + monthly)
export const fetchAdminDashboardStats = createAsyncThunk(
  "records/fetchAdminDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/records/dashboard-stats");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "❌ Failed to fetch dashboard stats"
      );
    }
  }
);

// 🧩 Fetch recent records
export const fetchRecentRecords = createAsyncThunk(
  "records/fetchRecentRecords",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/records/recent");
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "❌ Failed to fetch recent records"
      );
    }
  }
);

// 🧩 Fetch Monthly Report (HTML only, Admin)
export const fetchMonthlyReport = createAsyncThunk(
  "records/fetchMonthlyReport",
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const res = await api.get("/records/monthly-report", {
        params: { month, year },
      });
      return res.data; // raw HTML
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "❌ Failed to fetch monthly report"
      );
    }
  }
);

/* ============================================================
🔹 HELPERS
============================================================ */

const normalizeRecords = (records = []) =>
  records.map((r) => ({
    ...r,
    receivingLeadTime: r.receivingLeadTime ?? null,
    forwardingLeadTime: r.forwardingLeadTime ?? null,
  }));

/* ============================================================
🔹 INITIAL STATE
============================================================ */

const initialState = {
  records: [],
  selectedRecord: null,
  currentPage: 1,
  totalPages: 1,
  totalRecords: 0,
  pageSize: 30,
  search: "",
  court: "All",
  status: "All",
  dashboardStats: {
    totalRecords: 0,
    approved: 0,
    rejected: 0,
    weekly: [],
    monthly: [],
  },
  recentRecords: [],
  monthlyReportHTML: "", // new
  loading: false,
  error: null,
  message: null,
};

/* ============================================================
🔹 SLICE
============================================================ */

const recordsSlice = createSlice({
  name: "records",
  initialState,
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
      state.currentPage = 1;
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
      /* =====================================================
      🧩 FETCH USER RECORDS
      ===================================================== */
      .addCase(fetchRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = normalizeRecords(action.payload.records);
        state.currentPage = action.payload.currentPage || 1;
        state.totalPages = action.payload.totalPages || 1;
        state.totalRecords = action.payload.totalRecords || 0;
      })
      .addCase(fetchRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* =====================================================
      🧩 ADMIN FETCH ALL
      ===================================================== */
      .addCase(fetchAllRecordsForAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllRecordsForAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.records = normalizeRecords(action.payload.records);
        state.currentPage = action.payload.currentPage || 1;
        state.totalPages = action.payload.totalPages || 1;
        state.totalRecords = action.payload.totalRecords || 0;
      })
      .addCase(fetchAllRecordsForAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* =====================================================
      🧩 ADD RECORD
      ===================================================== */
      .addCase(addRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.records.unshift({
          ...action.payload,
          receivingLeadTime: action.payload.receivingLeadTime ?? null,
          forwardingLeadTime: action.payload.forwardingLeadTime ?? null,
        });
        state.totalRecords += 1;
        state.message = "✅ Record added successfully";
      })
      .addCase(addRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* =====================================================
      🧩 UPDATE RECORD
      ===================================================== */
      .addCase(updateRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRecord.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.records.findIndex(
          (r) => r._id === action.payload._id
        );
        if (idx !== -1) {
          state.records[idx] = {
            ...action.payload,
            receivingLeadTime: action.payload.receivingLeadTime ?? null,
            forwardingLeadTime: action.payload.forwardingLeadTime ?? null,
          };
        }
        state.message = "✅ Record updated successfully";
      })
      .addCase(updateRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* =====================================================
      🧩 DELETE RECORD
      ===================================================== */
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
      })

      /* =====================================================
      🧩 BULK UPDATE DATE FORWARDED
      ===================================================== */
      .addCase(updateMultipleRecordsDateForwarded.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        updateMultipleRecordsDateForwarded.fulfilled,
        (state, action) => {
          state.loading = false;
          const updated = action.payload.updatedRecords || [];
          updated.forEach((rec) => {
            const idx = state.records.findIndex((r) => r._id === rec._id);
            if (idx !== -1) {
              state.records[idx] = {
                ...state.records[idx],
                ...rec,
                forwardingLeadTime: rec.forwardingLeadTime ?? null,
              };
            }
          });
          state.message =
            action.payload.message || "✅ Records updated successfully";
        }
      )
      .addCase(updateMultipleRecordsDateForwarded.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* =====================================================
      🧩 DASHBOARD STATS
      ===================================================== */
      .addCase(fetchAdminDashboardStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchAdminDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* =====================================================
      🧩 RECENT RECORDS
      ===================================================== */
      .addCase(fetchRecentRecords.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRecentRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.recentRecords = normalizeRecords(action.payload.records);
      })
      .addCase(fetchRecentRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* =====================================================
      🧩 MONTHLY REPORT HTML
      ===================================================== */
      .addCase(fetchMonthlyReport.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.monthlyReportHTML = "";
      })
      .addCase(fetchMonthlyReport.fulfilled, (state, action) => {
        state.loading = false;
        state.monthlyReportHTML = action.payload;
      })
      .addCase(fetchMonthlyReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

/* ============================================================
🔹 EXPORTS
============================================================ */
export const {
  clearSelectedRecord,
  resetRecordState,
  setFilters,
  resetFilters,
  setPage,
  setPageSize,
} = recordsSlice.actions;

export default recordsSlice.reducer;
