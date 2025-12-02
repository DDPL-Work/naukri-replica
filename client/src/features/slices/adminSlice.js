import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// -------------------------------
// API URL
// -------------------------------
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// -------------------------------
// CREATE RECRUITER
// -------------------------------
export const registerRecruiter = createAsyncThunk(
  "recruiter/registerRecruiter",
  async (payload, { rejectWithValue, getState }) => {
    try {
      const token = getState()?.auth?.token;

      const res = await axios.post(
        `${API_BASE}/auth/register-recruiter`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to create recruiter"
      );
    }
  }
);

// -------------------------------
// LIST RECRUITERS (ADMIN ONLY)
// -------------------------------
export const listRecruiters = createAsyncThunk(
  "recruiter/listRecruiters",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState()?.auth?.token;

      const res = await axios.get(`${API_BASE}/admin/recruiters`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data.recruiters;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch recruiters"
      );
    }
  }
);

// -------------------------------
// UPDATE RECRUITER (activate/deactivate/limit)
// -------------------------------
export const updateRecruiter = createAsyncThunk(
  "recruiter/updateRecruiter",
  async ({ id, updates }, { rejectWithValue, getState }) => {
    try {
      const token = getState()?.auth?.token;

      const res = await axios.patch(
        `${API_BASE}/admin/recruiters/${id}`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return res.data.recruiter;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to update recruiter"
      );
    }
  }
);

// -------------------------------
// SLICE
// -------------------------------
const recruiterSlice = createSlice({
  name: "recruiter",

  initialState: {
    loading: false,
    success: false,
    error: null,

    // Create recruiter
    createdRecruiterId: null,

    // List recruiters
    recruiters: [],
    listLoading: false,
    listError: null,

    // Update recruiter
    updateLoading: false,
    updateSuccess: false,
    updateError: null,
  },

  reducers: {
    resetRecruiterState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.createdRecruiterId = null;
    },

    resetRecruiterUpdateState: (state) => {
      state.updateLoading = false;
      state.updateSuccess = false;
      state.updateError = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // -------------------------------
      // REGISTER RECRUITER
      // -------------------------------
      .addCase(registerRecruiter.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.createdRecruiterId = null;
      })

      .addCase(registerRecruiter.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.createdRecruiterId = action.payload.recruiterId;
      })

      .addCase(registerRecruiter.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })

      // -------------------------------
      // LIST RECRUITERS
      // -------------------------------
      .addCase(listRecruiters.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })

      .addCase(listRecruiters.fulfilled, (state, action) => {
        state.listLoading = false;
        state.recruiters = action.payload;
      })

      .addCase(listRecruiters.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload;
      })

      // -------------------------------
      // UPDATE RECRUITER
      // -------------------------------
      .addCase(updateRecruiter.pending, (state) => {
        state.updateLoading = true;
        state.updateSuccess = false;
        state.updateError = null;
      })

      .addCase(updateRecruiter.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = true;

        // Update recruiter in list
        state.recruiters = state.recruiters.map((r) =>
          r._id === action.payload._id ? action.payload : r
        );
      })

      .addCase(updateRecruiter.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = false;
        state.updateError = action.payload;
      });
  },
});

export const { resetRecruiterState, resetRecruiterUpdateState } =
  recruiterSlice.actions;

export default recruiterSlice.reducer;
