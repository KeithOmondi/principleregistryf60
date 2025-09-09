import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "http://localhost:8000/api/v1/courts";

const initialState = {
  list: [],
  loading: false,
  error: null,
};

// ✅ Fetch all courts
export const fetchCourts = createAsyncThunk("courts/fetch", async (_, thunkAPI) => {
  try {
    const res = await axios.get(`${BASE_URL}/all`, { withCredentials: true });
    // adjust this if your backend sends { data: courts } or { courts: [...] }
    return res.data.data || res.data.courts || [];
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch courts");
  }
});

// ✅ Create a single court
export const createCourt = createAsyncThunk("courts/create", async (court, thunkAPI) => {
  try {
    const res = await axios.post(`${BASE_URL}/create`, court, { withCredentials: true });
    return res.data.data || res.data.court;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to create court");
  }
});

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
        state.error = action.payload || "Failed to load courts";
      })
      // create
      .addCase(createCourt.fulfilled, (state, action) => {
        state.list = [...state.list, action.payload];
      })
      .addCase(createCourt.rejected, (state, action) => {
        state.error = action.payload || "Failed to create court";
      });
  },
});

export default courtSlice.reducer;
