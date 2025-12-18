import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

/* ------------------------------------
   FETCH ADMIN UPLOAD LOGS
------------------------------------ */
export const fetchAdminUploadLogs = createAsyncThunk(
  "adminUploadLogs/fetchAdminUploadLogs",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState()?.auth?.token;

      const res = await axios.get(`${API_BASE}/admin/upload-logs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data.logs;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch admin upload logs"
      );
    }
  }
);

/* ------------------------------------
   SLICE
------------------------------------ */
const adminUploadLogSlice = createSlice({
  name: "adminUploadLogs",

  initialState: {
    logs: [],
    loading: false,
    error: null,
  },

  reducers: {
    resetAdminUploadLogs: (state) => {
      state.logs = [];
      state.loading = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminUploadLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchAdminUploadLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
      })

      .addCase(fetchAdminUploadLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetAdminUploadLogs } = adminUploadLogSlice.actions;
export default adminUploadLogSlice.reducer;
