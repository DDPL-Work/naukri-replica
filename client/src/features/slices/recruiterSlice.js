// features/slices/recruiterSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../API/axiosInstance"; // your axios instance with token interceptor

// SEARCH CANDIDATES thunk
export const searchCandidates = createAsyncThunk(
  "recruiter/searchCandidates",
  async (params = {}, { rejectWithValue }) => {
    try {
      // params: q, page, size, location, minExp, maxExp, skills, designation
      const res = await API.get("/candidates/search", { params });
      return res.data; // expected { total, results }
    } catch (err) {
      const message =
        err.response?.data?.error || err.response?.data?.message || err.message;
      return rejectWithValue(message);
    }
  }
);

// GET CANDIDATE by ID thunk
export const getCandidateById = createAsyncThunk(
  "recruiter/getCandidateById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await API.get(`/candidates/${id}?noLog=true`);
      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.error || err.response?.data?.message || err.message;
      return rejectWithValue(message);
    }
  }
);

// UPDATE FEEDBACK / REMARK thunk
export const updateCandidateFeedback = createAsyncThunk(
  "recruiter/updateCandidateFeedback",
  async ({ id, remark }, { rejectWithValue }) => {
    try {
      const res = await API.patch(`/candidates/${id}/feedback`, { remark });
      return res.data;
    } catch (err) {
      const message =
        err.response?.data?.error || err.response?.data?.message || err.message;
      return rejectWithValue(message);
    }
  }
);

// DOWNLOAD RESUME thunk
export const downloadResumeThunk = createAsyncThunk(
  "recruiter/downloadResume",
  async (candidateId, { rejectWithValue }) => {
    try {
      const res = await API.post(`/downloads/${candidateId}`);

      console.log("DOWNLOAD RESPONSE:", res.data);

      return {
        candidateId,
        url: res.data.resumeUrl, // FIXED HERE
      };
    } catch (err) {
      const message =
        err.response?.data?.error || err.response?.data?.message || err.message;
      return rejectWithValue(message);
    }
  }
);


export const downloadLogsThunk=  createAsyncThunk()

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
    downloading: {},
    resumeDownloadError: null,
    resumeDownloadData: null,
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
  },
  extraReducers: (builder) => {
    builder
      // search
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
        state.searchError = action.payload || "Failed to search candidates";
      })

      // candidate detail
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
        state.candidateError = action.payload || "Failed to load candidate";
      })
      // UPDATE FEEDBACK
      .addCase(updateCandidateFeedback.pending, (state) => {
        state.feedbackUpdating = true;
      })
      .addCase(updateCandidateFeedback.fulfilled, (state, action) => {
        state.feedbackUpdating = false;

        // update remark in UI immediately
        if (state.candidateData) {
          state.candidateData.remark = action.meta.arg.remark;
        }
      })

      .addCase(updateCandidateFeedback.rejected, (state, action) => {
        state.feedbackUpdating = false;
        state.feedbackError = action.payload || "Failed to update feedback";
      })
      // Resume Download
      .addCase(downloadResumeThunk.pending, (state, action) => {
        const id = action.meta.arg;
        state.downloading[id] = true;
        state.resumeDownloadError = null;
      })
      .addCase(downloadResumeThunk.fulfilled, (state, action) => {
        const { candidateId, url } = action.payload;

        delete state.downloading[candidateId];

        if (url) {
          // Auto-download ONLY (no opening same tab)
          const link = document.createElement("a");
          link.href = url;
          link.target = "_blank"; // so it opens in new tab
          link.download = "resume.pdf";
          document.body.appendChild(link);
          link.click();
          link.remove();
        }
      })

      .addCase(downloadResumeThunk.rejected, (state, action) => {
        const id = action.meta.arg;
        delete state.downloading[id];
        state.resumeDownloadError =
          action.payload || "Failed to download resume";
      });
  },
});

export const { resetCandidateState, resetSearchState } = recruiterSlice.actions;
export default recruiterSlice.reducer;
