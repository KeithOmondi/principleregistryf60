// store/matchSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE || "https://principle-registry.onrender.com/api/v1/gazette";

// ------------------ Async Thunks ------------------

// Upload PDF + Excel files and process matches
export const uploadFiles = createAsyncThunk(
  "match/uploadFiles",
  async ({ pdfFile, excelFile, mode = "tokens", threshold = 0.8 }, { rejectWithValue }) => {
    try {
      const form = new FormData();
      form.append("pdfFile", pdfFile);
      form.append("excelFile", excelFile);

      console.log("Uploading files to:", `${API_BASE}/match`);

      const res = await axios.post(
        `${API_BASE}/match?mode=${mode}&threshold=${threshold}`,
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 600000,
          withCredentials: true, // <-- send cookies
          onUploadProgress: (evt) => evt.total && console.log(`Upload: ${((evt.loaded / evt.total) * 100).toFixed(2)}%`),
          onDownloadProgress: (evt) => evt.total && console.log(`Download: ${((evt.loaded / evt.total) * 100).toFixed(2)}%`),
        }
      );
      console.log("Upload response:", res.data);
      return res.data;
    } catch (err) {
      console.error("Upload error:", err);
      return rejectWithValue(err.response?.data?.error || "File matching failed");
    }
  }
);

// Clear all matches from DB
export const clearMatchesDB = createAsyncThunk(
  "match/clearMatchesDB",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Clearing all matches in DB...");
      const res = await axios.post(`${API_BASE}/clear-records`, {}, { withCredentials: true });
      console.log("Clear DB response:", res.data);
      return res.data;
    } catch (err) {
      console.error("Clear DB error:", err);
      return rejectWithValue(err.response?.data?.error || "Failed to clear DB");
    }
  }
);

// Fetch all matches from DB
export const fetchAllMatches = createAsyncThunk(
  "match/fetchAllMatches",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Fetching all matches...");
      const res = await axios.get(`${API_BASE}/matches`, { withCredentials: true });
      console.log("Fetch matches response:", res.data);
      return res.data.rows;
    } catch (err) {
      console.error("Fetch matches error:", err);
      return rejectWithValue(err.response?.data?.error || "Failed to fetch matches");
    }
  }
);

// ------------------ Slice ------------------
const matchSlice = createSlice({
  name: "match",
  initialState: {
    matches: [],
    stats: null,
    loading: false,
    error: null,
  },
  reducers: {
    resetMatchState: (state) => {
      state.matches = [];
      state.stats = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload files
      .addCase(uploadFiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadFiles.fulfilled, (state, action) => {
        state.loading = false;
        state.matches = action.payload.matchedRows || [];
        state.stats = action.payload;
      })
      .addCase(uploadFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Clear DB
      .addCase(clearMatchesDB.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearMatchesDB.fulfilled, (state) => {
        state.loading = false;
        state.matches = [];
        state.stats = null;
      })
      .addCase(clearMatchesDB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch all matches
      .addCase(fetchAllMatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllMatches.fulfilled, (state, action) => {
        state.loading = false;
        state.matches = action.payload;
      })
      .addCase(fetchAllMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetMatchState } = matchSlice.actions;
export default matchSlice.reducer;
