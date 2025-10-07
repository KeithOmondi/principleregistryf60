import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

axios.defaults.withCredentials = true;

const AUTH_API = "https://principle-registry.onrender.com/api/v1/auth";
const USER_API = "https://principle-registry.onrender.com/api/v1/user";

/* ==========================
   INITIAL STATE
========================== */
const initialState = {
  user: null,
  users: [],
  isAuthenticated: false,
  loading: false,
  error: null,
  message: null,
  pendingEmail: null, // used during OTP verification
};

/* ==========================
   HELPER: AUTH HEADERS
========================== */
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/* ==========================
   ASYNC THUNKS
========================== */

// ✅ Register user
export const register = createAsyncThunk(
  "auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${AUTH_API}/register`, formData);
      return { message: res.data.message, pendingEmail: formData.email };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Registration failed");
    }
  }
);

// ✅ Verify OTP
export const otpVerification = createAsyncThunk(
  "auth/verifyOTP",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${AUTH_API}/verify-otp`, { email, otp });
      return {
        user: res.data.user,
        isAuthenticated: true,
        message: res.data.message,
        pendingEmail: null,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "OTP verification failed");
    }
  }
);

// ✅ Login
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${AUTH_API}/login`, credentials);
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

// ✅ Logout
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await axios.get(`${AUTH_API}/logout`);
      localStorage.removeItem("token");
      return { message: "Logged out successfully", user: null, isAuthenticated: false };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Logout failed");
    }
  }
);

// ✅ Load logged-in user (session restore)
export const loadUser = createAsyncThunk(
  "auth/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${AUTH_API}/me`, { headers: getAuthHeaders() });
      return { user: res.data.user, isAuthenticated: true };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load user");
    }
  }
);

// ✅ Forgot password
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${AUTH_API}/password/forgot`, { email });
      return { message: res.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to send reset email");
    }
  }
);

// ✅ Reset password via token
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
      return rejectWithValue(err.response?.data?.message || "Password reset failed");
    }
  }
);

// ✅ Update password (while logged in)
export const updatePassword = createAsyncThunk(
  "auth/updatePassword",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${AUTH_API}/password/update`, data, {
        headers: getAuthHeaders(),
      });
      return { message: res.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update password");
    }
  }
);

// ✅ Fetch all users (Admin)
export const fetchAllUsers = createAsyncThunk(
  "auth/fetchAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${USER_API}/all`, {
        headers: getAuthHeaders(),
      });
      return res.data.users;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch users");
    }
  }
);

// ✅ Delete user (Admin)
export const deleteUser = createAsyncThunk(
  "auth/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`${USER_API}/${id}`, {
        headers: getAuthHeaders(),
      });
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
      state.loading = false;
      state.error = null;
      state.message = null;
    },
    clearPendingEmail: (state) => {
      state.pendingEmail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🟢 Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.pendingEmail = action.payload.pendingEmail;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🟢 OTP Verification
      .addCase(otpVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(otpVerification.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.pendingEmail = null;
        state.message = action.payload.message;
      })
      .addCase(otpVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🟢 Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.message = action.payload.message;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🟢 Logout
      .addCase(logout.fulfilled, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.message = action.payload.message;
      })
      .addCase(logout.rejected, (state, action) => {
        state.error = action.payload;
      })

      // 🟢 Load user
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      })

      // 🟢 Forgot password
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.message = action.payload.message;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.error = action.payload;
      })

      // 🟢 Reset password
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.message = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.error = action.payload;
      })

      // 🟢 Update password
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.message = action.payload.message;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.error = action.payload;
      })

      // 🟢 Fetch users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload || [];
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🟢 Delete user
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter((u) => u._id !== action.payload.id);
        state.message = action.payload.message;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

/* ==========================
   EXPORTS
========================== */
export const { resetAuthState, clearPendingEmail } = authSlice.actions;
export default authSlice.reducer;

/* ==========================
   SELECTORS
========================== */
export const selectAuthUser = (state) => state.auth.user;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthMessage = (state) => state.auth.message;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAllUsers = (state) => state.auth.users;
export const selectPendingEmail = (state) => state.auth.pendingEmail;
