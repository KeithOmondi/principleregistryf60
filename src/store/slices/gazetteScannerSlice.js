import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

/* ======================================================
   THUNKS
====================================================== */

export const scanGazette = createAsyncThunk(
  "gazetteScanner/scanGazette",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("scan", file);

      const { data } = await api.post("/gazette/scan", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Scan failed");
    }
  }
);

export const fetchGazettes = createAsyncThunk(
  "gazetteScanner/fetchGazettes",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/gazette/get", { withCredentials: true });
      return data.gazettes || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch gazettes");
    }
  }
);

export const fetchGazetteDetails = createAsyncThunk(
  "gazetteScanner/fetchGazetteDetails",
  async (gazetteId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/gazette/get/${gazetteId}`, { withCredentials: true });
      return data.gazette;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch details");
    }
  }
);

export const fetchScanLogs = createAsyncThunk(
  "gazetteScanner/fetchScanLogs",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/gazette/logs", { withCredentials: true });
      return data.logs || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch logs");
    }
  }
);

/* ======================================================
   SLICE
====================================================== */
const gazetteScannerSlice = createSlice({
  name: "gazetteScanner",
  initialState: {
    gazettes: [],
    gazetteDetails: {},
    logs: [],
    scanLoading: false,
    scanError: null,
    fetchLoading: false,
    fetchError: null,
    detailsLoadingId: null,
    detailsError: null,
    logsLoading: false,
    logsError: null,
  },
  reducers: {
    resetScanState: (state) => {
      state.scanLoading = false;
      state.scanError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* --- Scan --- */
      .addCase(scanGazette.pending, (state) => {
        state.scanLoading = true;
        state.scanError = null;
      })
      .addCase(scanGazette.fulfilled, (state) => {
        state.scanLoading = false;
      })
      .addCase(scanGazette.rejected, (state, action) => {
        state.scanLoading = false;
        state.scanError = action.payload;
      })

      /* --- Fetch Gazettes --- */
      .addCase(fetchGazettes.pending, (state) => {
        state.fetchLoading = true;
        state.fetchError = null;
      })
      .addCase(fetchGazettes.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.gazettes = action.payload;
      })
      .addCase(fetchGazettes.rejected, (state, action) => {
        state.fetchLoading = false;
        state.fetchError = action.payload;
      })

      /* --- Fetch Details --- */
      .addCase(fetchGazetteDetails.pending, (state, action) => {
        state.detailsLoadingId = action.meta.arg;
        state.detailsError = null;
      })
      .addCase(fetchGazetteDetails.fulfilled, (state, action) => {
        state.detailsLoadingId = null;

        const gazetteId = action.payload._id;
        const existing = state.gazettes.find((g) => g._id === gazetteId);
        if (existing) {
          existing.fullCases = action.payload.cases; // store detailed cases in that gazette
        }

        state.gazetteDetails = action.payload;
      })
      .addCase(fetchGazetteDetails.rejected, (state, action) => {
        state.detailsLoadingId = null;
        state.detailsError = action.payload;
      })

      /* --- Fetch Logs --- */
      .addCase(fetchScanLogs.pending, (state) => {
        state.logsLoading = true;
        state.logsError = null;
      })
      .addCase(fetchScanLogs.fulfilled, (state, action) => {
        state.logsLoading = false;
        state.logs = action.payload;
      })
      .addCase(fetchScanLogs.rejected, (state, action) => {
        state.logsLoading = false;
        state.logsError = action.payload;
      });
  },
});

export const { resetScanState } = gazetteScannerSlice.actions;
export default gazetteScannerSlice.reducer;
