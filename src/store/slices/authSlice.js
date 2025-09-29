// store/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

axios.defaults.withCredentials = true;

const API_BASE = "https://principle-registry.onrender.com/api/v1/user";
const AUTH_API = "https://principle-registry.onrender.com/api/v1/auth";

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
  pendingEmail: null, // <-- used for OTP verification step
};

// ==========================
// Async Thunks
// ==========================

// Register
export const register = createAsyncThunk(
  "auth/register",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${AUTH_API}/register`, data);
      return { message: res.data.message, pendingEmail: data.email };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Registration failed");
    }
  }
);

// Verify OTP
export const otpVerification = createAsyncThunk(
  "auth/verifyOtp",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${AUTH_API}/verify-otp`, { email, otp });
      return {
        user: res.data.user,
        isAuthenticated: true,
        message: res.data.message,
        pendingEmail: null, // clear pendingEmail once verified
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "OTP verification failed");
    }
  }
);

// Login
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

// Logout
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${AUTH_API}/logout`);
      return { message: res.data.message, user: null, isAuthenticated: false };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Logout failed");
    }
  }
);

// Load User (session restore)
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

// Forgot Password
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

// Reset Password (via token link)
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

// Update Password (while logged in)
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
    resetAuthState: (state) => {
      state.loading = false;
      state.error = null;
      state.message = null;
      // keep user & pendingEmail intact unless explicitly cleared
    },
    clearPendingEmail: (state) => {
      state.pendingEmail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ General loading
      .addMatcher(
        (action) => action.type.startsWith("auth/") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
          state.message = null;
        }
      )
      // ✅ Success
      .addMatcher(
        (action) => action.type.startsWith("auth/") && action.type.endsWith("/fulfilled"),
        (state, action) => {
          state.loading = false;
          if (action.payload.user !== undefined) state.user = action.payload.user;
          if (action.payload.isAuthenticated !== undefined)
            state.isAuthenticated = action.payload.isAuthenticated;
          if (action.payload.message) state.message = action.payload.message;
          if (action.payload.pendingEmail !== undefined)
            state.pendingEmail = action.payload.pendingEmail;
          state.error = null;
        }
      )
      // ✅ Error
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
export const { resetAuthState, clearPendingEmail } = authSlice.actions;
export default authSlice.reducer;
