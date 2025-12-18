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
// DELETE RECRUITER (PERMANENT)
// -------------------------------
export const deleteRecruiter = createAsyncThunk(
  "recruiter/deleteRecruiter",
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getState()?.auth?.token;

      await axios.delete(`${API_BASE}/admin/recruiters/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return id;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to delete recruiter"
      );
    }
  }
);

// -------------------------------
// RECRUITER DOWNLOAD USAGE (TODAY)
// -------------------------------
export const fetchRecruiterUsageToday = createAsyncThunk(
  "admin/fetchRecruiterUsageToday",
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState()?.auth?.token;

      const res = await axios.get(
        `${API_BASE}/admin/analytics/recruiter-download-usage`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch recruiter usage"
      );
    }
  }
);


// -------------------------------
// ADMIN ANALYTICS
// -------------------------------
export const fetchAnalytics = createAsyncThunk(
  "analytics/fetchAnalytics",
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const token = getState()?.auth?.token;

      const res = await axios.get(`${API_BASE}/admin/analytics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || "Failed to fetch analytics"
      );
    }
  }
);

// -------------------------------
// ADD CANDIDATE MANUALLY (ADMIN ONLY)
// -------------------------------
export const addCandidateManual = createAsyncThunk(
  "admin/addCandidateManual",
  async (formData, { rejectWithValue, getState }) => {
    try {
      const token = getState()?.auth?.token;

      const res = await axios.post(`${API_BASE}/admin/add-manual`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data.candidate;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.reason ||
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to add candidate"
      );
    }
  }
);

// -------------------------------
// SLICE
// -------------------------------
const adminSlice = createSlice({
  name: "admin",

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

    // ANALYTICS
    analyticsLoading: false,
    analyticsError: null,
    analyticsData: null,

    // Manual candidate add
    manualAddLoading: false,
    manualAddSuccess: false,
    manualAddError: null,
    newCandidate: null,
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

    resetAnalyticsState: (state) => {
      state.analyticsLoading = false;
      state.analyticsError = null;
      state.analyticsData = null;
    },

    resetManualAddState: (state) => {
      state.manualAddLoading = false;
      state.manualAddSuccess = false;
      state.manualAddError = null;
      state.newCandidate = null;
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
        state.recruiterCount = action.payload.length;
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
      })

      // -------------------------------
      // DELETE RECRUITER
      // -------------------------------

      .addCase(deleteRecruiter.pending, (state) => {
        state.updateLoading = true;
      })

      .addCase(deleteRecruiter.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.recruiters = state.recruiters.filter(
          (r) => r._id !== action.payload
        );
      })

      .addCase(deleteRecruiter.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })

      .addCase(fetchRecruiterUsageToday.pending, (state) => {
  state.recruiterUsageLoading = true;
})

.addCase(fetchRecruiterUsageToday.fulfilled, (state, action) => {
  state.recruiterUsageLoading = false;
  state.recruiterUsageData = action.payload;
})

.addCase(fetchRecruiterUsageToday.rejected, (state, action) => {
  state.recruiterUsageLoading = false;
  state.recruiterUsageError = action.payload;
})


      // -------------------------------
      // ANALYTICS
      // -------------------------------
      .addCase(fetchAnalytics.pending, (state) => {
        state.analyticsLoading = true;
        state.analyticsError = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.analyticsData = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.analyticsError = action.payload;
      })

      // -------------------------------
      // ADD CANDIDATE MANUALLY
      // -------------------------------
      .addCase(addCandidateManual.pending, (state) => {
        state.manualAddLoading = true;
        state.manualAddSuccess = false;
        state.manualAddError = null;
        state.newCandidate = null;
      })

      .addCase(addCandidateManual.fulfilled, (state, action) => {
        state.manualAddLoading = false;
        state.manualAddSuccess = true;
        state.newCandidate = action.payload;
      })

      .addCase(addCandidateManual.rejected, (state, action) => {
        state.manualAddLoading = false;
        state.manualAddSuccess = false;
        state.manualAddError = action.payload;
      });
  },
});

export const {
  resetRecruiterState,
  resetRecruiterUpdateState,
  resetAnalyticsState,
  resetManualAddState,
} = adminSlice.actions;

export default adminSlice.reducer;
