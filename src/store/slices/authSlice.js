import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

axios.defaults.withCredentials = true;

const API_BASE = "http://localhost:8000/api/v1/user";
const AUTH_API = "http://localhost:8000/api/v1/auth";

// ==========================
// Initial State
// ==========================
const initialState = {
  user: null,
  users: [],
  isAuthenticated: false,
  loading: false,
  error: null,
  message: null,
};

// ==========================
// Async Thunks
// ==========================
export const register = createAsyncThunk(
  "auth/register",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${AUTH_API}/register`, data);
      return { message: res.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Registration failed");
    }
  }
);

export const otpVerification = createAsyncThunk(
  "auth/verifyOtp",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${AUTH_API}/verify-otp`, { email, otp });
      return {
        user: res.data.user,
        isAuthenticated: true,
        message: res.data.message,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "OTP verification failed");
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${AUTH_API}/login`, data);
      return {
        user: res.data.user,
        isAuthenticated: true,
        message: res.data.message,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${AUTH_API}/logout`);
      return { message: res.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Logout failed");
    }
  }
);

export const loadUser = createAsyncThunk(
  "auth/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${AUTH_API}/me`);
      return { user: res.data.user, isAuthenticated: true };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load user");
    }
  }
);

export const updateUser = createAsyncThunk(
  "auth/updateUser",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${API_BASE}/update-user/${id}`, data);
      return {
        user: res.data.user,
        message: res.data.message,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Update failed");
    }
  }
);

export const fetchUserById = createAsyncThunk(
  "auth/fetchUserById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE}/get-user/${id}`);
      return res.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch user");
    }
  }
);

export const getAllUsers = createAsyncThunk(
  "auth/getAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE}/all`);
      return res.data.users;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch users");
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${AUTH_API}/password/forgot`, { email });
      return { message: res.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Forgot password failed");
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, data }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${AUTH_API}/password/reset/${token}`, data);
      return {
        user: res.data.user,
        isAuthenticated: true,
        message: res.data.message,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Reset password failed");
    }
  }
);

export const updatePassword = createAsyncThunk(
  "auth/updatePassword",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${AUTH_API}/password/update`, data);
      return { message: res.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Update password failed");
    }
  }
);

// ==========================
// Slice
// ==========================
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // ✅ Handle getAllUsers properly
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
        state.error = null;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ General loading state
      .addMatcher(
        (action) => action.type.startsWith("auth/") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      // ✅ General success handler (EXCEPT for getAllUsers)
      .addMatcher(
        (action) =>
          action.type.startsWith("auth/") &&
          action.type.endsWith("/fulfilled") &&
          action.type !== getAllUsers.fulfilled.type,
        (state, action) => {
          state.loading = false;
          Object.assign(state, action.payload);
          state.error = null;
        }
      )

      // ✅ General error handler
      .addMatcher(
        (action) => action.type.startsWith("auth/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

// ==========================
// Exports
// ==========================
export const { resetAuthState } = authSlice.actions;
export default authSlice.reducer;
