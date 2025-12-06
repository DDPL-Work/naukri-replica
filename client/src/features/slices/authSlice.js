import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const LOGIN_URL = `${BASE_URL}/auth/login`;

// ------------------------------------------------------------
// LOGIN
// ------------------------------------------------------------
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password, role }, { rejectWithValue }) => {
    try {
      const response = await axios.post(LOGIN_URL, { email, password, role });
      const data = response.data;

      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));

      return data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Login failed. Try again."
      );
    }
  }
);

// ------------------------------------------------------------
// LOGOUT THUNK
// ------------------------------------------------------------
export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  return true;
});

// ------------------------------------------------------------
// INITIAL STATE
// ------------------------------------------------------------
const storedUser = sessionStorage.getItem("user");
const storedToken = sessionStorage.getItem("token");

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  role: storedUser ? JSON.parse(storedUser).role : null,
  loading: false,
  error: null,
};

// ------------------------------------------------------------
// SLICE
// ------------------------------------------------------------
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // FIX: renamed to avoid conflict with thunk
    clearAuthState: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.error = null;
      state.loading = false;
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = sessionStorage.getItem("token");
        state.role = action.payload.role;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // LOGOUT
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.role = null;
        state.error = null;
        state.loading = false;
      });
  },
});

export const { clearAuthState } = authSlice.actions;
export default authSlice.reducer;
