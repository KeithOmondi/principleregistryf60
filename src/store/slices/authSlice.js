// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

/* ==========================
   INITIAL STATE
========================== */
const initialState = {
  user: null,
  users: [],
  isAuthenticated: false,
  authLoading: false,
  usersLoading: false,
  error: null,
  message: null,
  pendingEmail: null, // used for OTP verification
};

/* ==========================
   ASYNC THUNKS
========================== */

// --- Register
export const register = createAsyncThunk(
  "auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/register", formData);
      return { message: res.data.message, pendingEmail: formData.email };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Registration failed");
    }
  }
);

// --- Login
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/login", credentials);
      const token = res.data?.token;
      if (token) localStorage.setItem("token", token);
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

// --- Logout
export const logout = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await api.post("/auth/logout");
    localStorage.removeItem("token");
    return { message: "Logged out successfully" };
  } catch (err) {
    localStorage.removeItem("token");
    return rejectWithValue(err.response?.data?.message || "Logout failed");
  }
});

// --- Load User
export const loadUser = createAsyncThunk(
  "auth/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/auth/me");
      return { user: res.data.user, isAuthenticated: true };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load user");
    }
  }
);

// --- Forgot Password
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/forgot-password", { email });
      return { message: res.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to send reset link");
    }
  }
);

// --- Reset Password
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/auth/reset-password/${token}`, { password });
      return { message: res.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to reset password");
    }
  }
);

// --- OTP Verification
export const otpVerification = createAsyncThunk(
  "auth/otpVerification",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/verify-otp", { email, otp });
      return { message: res.data.message, success: true };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "OTP verification failed");
    }
  }
);

// --- Fetch All Users
export const fetchAllUsers = createAsyncThunk(
  "auth/fetchAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/user/all");
      return res.data.users || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch users");
    }
  }
);

// --- Delete User
export const deleteUser = createAsyncThunk(
  "auth/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/user/${id}`);
      return { id, message: res.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete user");
    }
  }
);

/* ==========================
   SLICE
========================== */
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthState: (state) => {
      state.authLoading = false;
      state.error = null;
      state.message = null;
    },
    clearPendingEmail: (state) => {
      state.pendingEmail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Register
      .addCase(register.pending, (state) => {
        state.authLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.authLoading = false;
        state.message = action.payload.message;
        state.pendingEmail = action.payload.pendingEmail;
      })
      .addCase(register.rejected, (state, action) => {
        state.authLoading = false;
        state.error = action.payload;
      })

      // --- Login
      .addCase(login.pending, (state) => {
        state.authLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.authLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.message = action.payload.message;
      })
      .addCase(login.rejected, (state, action) => {
        state.authLoading = false;
        state.error = action.payload;
      })

      // --- Logout
      .addCase(logout.pending, (state) => {
        state.authLoading = true;
      })
      .addCase(logout.fulfilled, (state, action) => {
        state.authLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.message = action.payload.message;
      })
      .addCase(logout.rejected, (state, action) => {
        state.authLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      })

      // --- Load User
      .addCase(loadUser.pending, (state) => {
        state.authLoading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.authLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.authLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      })

      // --- Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.authLoading = true;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.authLoading = false;
        state.message = action.payload.message;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.authLoading = false;
        state.error = action.payload;
      })

      // --- Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.authLoading = true;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.authLoading = false;
        state.message = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.authLoading = false;
        state.error = action.payload;
      })

      // --- OTP Verification
      .addCase(otpVerification.pending, (state) => {
        state.authLoading = true;
      })
      .addCase(otpVerification.fulfilled, (state, action) => {
        state.authLoading = false;
        state.message = action.payload.message;
        state.pendingEmail = null;
      })
      .addCase(otpVerification.rejected, (state, action) => {
        state.authLoading = false;
        state.error = action.payload;
      })

      // --- Fetch Users
      .addCase(fetchAllUsers.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload || [];
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload;
      })

      // --- Delete User
      .addCase(deleteUser.pending, (state) => {
        state.usersLoading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = state.users.filter((u) => u._id !== action.payload.id);
        state.message = action.payload.message;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload;
      });
  },
});

/* ==========================
   EXPORTS
========================== */
export const {
  resetAuthState,
  clearPendingEmail,
} = authSlice.actions;

export default authSlice.reducer;

/* ==========================
   SELECTORS
========================== */
export const selectAuthUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.authLoading;
export const selectUsersLoading = (state) => state.auth.usersLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthMessage = (state) => state.auth.message;
export const selectAllUsers = (state) => state.auth.users;
export const selectPendingEmail = (state) => state.auth.pendingEmail;
