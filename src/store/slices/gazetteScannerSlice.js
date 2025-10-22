import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const SCAN_API = "https://principle-registry.onrender.com/api/v1/gazette";

/* ======================================================
   🧠 THUNK: Scan Gazette PDF
====================================================== */
export const scanGazette = createAsyncThunk(
  "gazetteScanner/scanGazette",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("scan", file);

      const { data } = await axios.post(`${SCAN_API}/scan`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      return data;
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Scan failed";
      return rejectWithValue(message);
    }
  }
);

/* ======================================================
   🧠 THUNK: Fetch Gazettes (metadata list)
====================================================== */
export const fetchGazettes = createAsyncThunk(
  "gazetteScanner/fetchGazettes",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${SCAN_API}/get`, {
        withCredentials: true,
      });
      return data.gazettes || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load gazettes"
      );
    }
  }
);

/* ======================================================
   🧠 THUNK: Fetch Specific Gazette Details
====================================================== */
export const fetchGazetteDetails = createAsyncThunk(
  "gazetteScanner/fetchGazetteDetails",
  async (gazetteId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${SCAN_API}/get/${gazetteId}`, {
        withCredentials: true,
      });
      return data.gazette || {};
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load gazette details"
      );
    }
  }
);

/* ======================================================
   🧠 THUNK: Fetch Scan Logs
====================================================== */
export const fetchScanLogs = createAsyncThunk(
  "gazetteScanner/fetchScanLogs",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${SCAN_API}/logs`, {
        withCredentials: true,
      });
      return data.logs || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch logs"
      );
    }
  }
);

/* ======================================================
   🧩 SLICE
====================================================== */
const gazetteScannerSlice = createSlice({
  name: "gazetteScanner",
  initialState: {
    loading: false,
    error: null,
    results: [],
    publishedCount: 0,
    totalRecords: 0,
    message: "",
    logs: [],
    gazettes: [],
  },
  reducers: {
    clearScanResults(state) {
      state.results = [];
      state.publishedCount = 0;
      state.totalRecords = 0;
      state.message = "";
      state.error = null;
    },
    loadScanResults(state, action) {
      const { updatedRecords, publishedCount, totalRecords } = action.payload;
      state.results = updatedRecords || [];
      state.publishedCount = publishedCount || 0;
      state.totalRecords = totalRecords || 0;
      state.message = "Results loaded from history.";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Scan Gazette ---
      .addCase(scanGazette.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(scanGazette.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.updatedRecords || [];
        state.publishedCount = action.payload.publishedCount || 0;
        state.totalRecords = action.payload.totalRecords || 0;
        state.message = action.payload.message || "Scan completed";

        if (action.payload.gazette) {
          state.gazettes.unshift(action.payload.gazette);
        }
      })
      .addCase(scanGazette.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Fetch Gazettes ---
      .addCase(fetchGazettes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGazettes.fulfilled, (state, action) => {
        state.loading = false;
        state.gazettes = action.payload;
      })
      .addCase(fetchGazettes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Fetch Gazette Details ---
      .addCase(fetchGazetteDetails.pending, (state) => {
        state.message = "Loading scan results...";
        state.error = null;
      })
      .addCase(fetchGazetteDetails.fulfilled, (state, action) => {
        const gazette = action.payload;
        state.results = gazette.cases || [];
        state.publishedCount = gazette.publishedCount || 0;
        state.totalRecords = gazette.totalRecords || 0;
        state.message = `Loaded results for ${gazette.fileName || "Gazette"}`;
      })
      .addCase(fetchGazetteDetails.rejected, (state, action) => {
        state.message = "";
        state.error = action.payload;
      })

      // --- Fetch Scan Logs ---
      .addCase(fetchScanLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScanLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
      })
      .addCase(fetchScanLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearScanResults, loadScanResults } = gazetteScannerSlice.actions;
export default gazetteScannerSlice.reducer;
