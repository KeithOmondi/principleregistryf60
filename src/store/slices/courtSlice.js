import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ Fixed BASE_URL
const BASE_URL = "https://principle-registry.onrender.com/api/v1/courts";

const initialState = {
  list: [],
  loading: false,
  error: null,
};

// ✅ Fetch all courts
export const fetchCourts = createAsyncThunk(
  "courts/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BASE_URL}/all`, { withCredentials: true });
      return res.data.data || res.data.courts || [];
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "❌ Failed to fetch courts"
      );
    }
  }
);

// ✅ Create a new court
export const createCourt = createAsyncThunk(
  "courts/create",
  async (court, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${BASE_URL}/create`, court, {
        withCredentials: true,
      });
      return res.data.data || res.data.court;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "❌ Failed to create court"
      );
    }
  }
);

const courtSlice = createSlice({
  name: "courts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchCourts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourts.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchCourts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "❌ Failed to load courts";
      })
      // create
      .addCase(createCourt.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(createCourt.rejected, (state, action) => {
        state.error = action.payload || "❌ Failed to create court";
      });
  },
});

export default courtSlice.reducer;
