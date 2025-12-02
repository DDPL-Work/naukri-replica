import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// -------------------------------------------------------------------
// BASE URL FROM ENV
// Vite requires all env vars to start with VITE_
// -------------------------------------------------------------------
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// Final login endpoint
const LOGIN_URL = `${BASE_URL}/auth/login`;

// -------------------------------------------------------------------
// THUNK: LOGIN USER
// -------------------------------------------------------------------
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password, role }, { rejectWithValue }) => {
    try {
      const response = await axios.post(LOGIN_URL, { email, password, role });
      const data = response.data;

      // Save token & user to sessionStorage
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));

      return data.user; // becomes action.payload
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Login failed. Try again."
      );
    }
  }
);

// -------------------------------------------------------------------
// THUNK: LOGOUT USER
// -------------------------------------------------------------------
export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  // Clear session storage
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");

  return true;
});

// -------------------------------------------------------------------
// INITIAL STATE (RESTORED FROM SESSION)
// -------------------------------------------------------------------
const storedUser = sessionStorage.getItem("user");
const storedToken = sessionStorage.getItem("token");

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  role: storedUser ? JSON.parse(storedUser).role : null,
  loading: false,
  error: null,
};

// -------------------------------------------------------------------
// AUTH SLICE
// -------------------------------------------------------------------
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logoutUser: (state) => {
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

export default authSlice.reducer;
