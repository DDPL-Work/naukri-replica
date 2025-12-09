// features/slices/recruiterSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../API/axiosInstance";

// -------------------------------------------------------------
// SEARCH CANDIDATES
// -------------------------------------------------------------
export const searchCandidates = createAsyncThunk(
  "recruiter/searchCandidates",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await API.get("/candidates/search", { params });
      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message;
      return rejectWithValue(message);
    }
  }
);

// -------------------------------------------------------------
// GET CANDIDATE BY ID
// -------------------------------------------------------------
export const getCandidateById = createAsyncThunk(
  "recruiter/getCandidateById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.get(`/candidates/${id}?noLog=true`);
      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message;
      return rejectWithValue(message);
    }
  }
);

// -------------------------------------------------------------
// UPDATE FEEDBACK
// -------------------------------------------------------------
export const updateCandidateFeedback = createAsyncThunk(
  "recruiter/updateCandidateFeedback",
  async ({ id, remark }, { rejectWithValue }) => {
    try {
      const res = await API.patch(`/candidates/${id}/feedback`, { remark });
      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message;
      return rejectWithValue(message);
    }
  }
);

// -------------------------------------------------------------
// DOWNLOAD RESUME
// Detect limit exceeded → return message clearly
// -------------------------------------------------------------
export const downloadResumeThunk = createAsyncThunk(
  "recruiter/downloadResume",
  async (candidateId, { rejectWithValue }) => {
    try {
      const res = await API.post(`/downloads/${candidateId}`);

      return {
        candidateId,
        url: res.data.resumeUrl,
      };
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Download failed";

      return rejectWithValue({ candidateId, message });
    }
  }
);

// -------------------------------------------------------------
// SLICE
// -------------------------------------------------------------
const recruiterSlice = createSlice({
  name: "recruiter",
  initialState: {
    searchLoading: false,
    searchError: null,
    searchResults: [],
    searchTotal: 0,

    candidateLoading: false,
    candidateError: null,
    candidateData: null,

    feedbackUpdating: false,
    feedbackError: null,

    downloading: {},               // { candidateId: true }
    downloadErrors: {},            // { candidateId: "Limit exceeded" }
  },

  reducers: {
    resetCandidateState(state) {
      state.candidateLoading = false;
      state.candidateError = null;
      state.candidateData = null;
    },
    resetSearchState(state) {
      state.searchLoading = false;
      state.searchError = null;
      state.searchResults = [];
      state.searchTotal = 0;
    },
    clearDownloadError(state, action) {
      delete state.downloadErrors[action.payload];
    },
  },

  extraReducers: (builder) => {
    builder

      // ---------------------------------------------------------
      // SEARCH
      // ---------------------------------------------------------
      .addCase(searchCandidates.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchCandidates.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.results || [];
        state.searchTotal = action.payload.total || 0;
      })
      .addCase(searchCandidates.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload;
      })

      // ---------------------------------------------------------
      // CANDIDATE DETAIL
      // ---------------------------------------------------------
      .addCase(getCandidateById.pending, (state) => {
        state.candidateLoading = true;
        state.candidateError = null;
      })
      .addCase(getCandidateById.fulfilled, (state, action) => {
        state.candidateLoading = false;
        state.candidateData = action.payload;
      })
      .addCase(getCandidateById.rejected, (state, action) => {
        state.candidateLoading = false;
        state.candidateError = action.payload;
      })

      // ---------------------------------------------------------
      // UPDATE FEEDBACK
      // ---------------------------------------------------------
      .addCase(updateCandidateFeedback.pending, (state) => {
        state.feedbackUpdating = true;
      })
      .addCase(updateCandidateFeedback.fulfilled, (state, action) => {
        state.feedbackUpdating = false;
        if (state.candidateData) {
          state.candidateData.remark = action.meta.arg.remark;
        }
      })
      .addCase(updateCandidateFeedback.rejected, (state, action) => {
        state.feedbackUpdating = false;
        state.feedbackError = action.payload;
      })

      // ---------------------------------------------------------
      // DOWNLOAD RESUME
      // ---------------------------------------------------------
      .addCase(downloadResumeThunk.pending, (state, action) => {
        const id = action.meta.arg;
        state.downloading[id] = true;
        delete state.downloadErrors[id];       // Clear previous error
      })

      .addCase(downloadResumeThunk.fulfilled, (state, action) => {
        const { candidateId, url } = action.payload;

        delete state.downloading[candidateId];
        delete state.downloadErrors[candidateId];

        // Auto-download
        if (url) {
          const link = document.createElement("a");
          link.href = url;
          link.target = "_blank";
          link.download = "resume.pdf";
          document.body.appendChild(link);
          link.click();
          link.remove();
        }
      })

      .addCase(downloadResumeThunk.rejected, (state, action) => {
        const { candidateId, message } = action.payload;

        delete state.downloading[candidateId];
        state.downloadErrors[candidateId] = message; // store error per candidate
      });
  },
});

export const {
  resetCandidateState,
  resetSearchState,
  clearDownloadError,
} = recruiterSlice.actions;

export default recruiterSlice.reducer;
