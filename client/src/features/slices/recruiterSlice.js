// features/slices/recruiterSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../API/axiosInstance";

// -----------------------------
// RESTORE SEARCH STATE FROM LOCAL STORAGE
// -----------------------------
// -----------------------------
// SAFE LOCALSTORAGE PARSER
// -----------------------------
function loadSearchState() {
  try {
    const raw = localStorage.getItem("searchState");

    // If null, empty, or "undefined", return fallback
    if (!raw || raw === "undefined" || raw === "null") {
      return {};
    }

    return JSON.parse(raw);
  } catch (err) {
    console.warn("Invalid searchState in localStorage. Resetting...");
    return {};
  }
}

const savedSearchState = loadSearchState();



// -----------------------------
// REAL INITIAL STATE (CORRECT & UNIFIED)
// -----------------------------
const initialState = {
  // ---------------- Candidate Profile ----------------
  candidateData: null,
  candidateLoading: false,
  candidateError: null,

  // ---------------- Search Results -------------------
  searchResults: [],
  searchLoading: false,
  searchError: null,
  searchTotal: 0,

  // ---------------- Resume Download ------------------
  downloading: {},
  downloadErrors: {},

  // ---------------- PERSISTED SEARCH STATE -------------
  searchState: {
    filters: savedSearchState.filters || {
      searchText: "",
      location: "",
      minExp: "",
      maxExp: "",
      designation: "",
      skills: [],
    },
    page: savedSearchState.page || 1,
    size: savedSearchState.size || 20,
    showResults: savedSearchState.showResults || false,
  },
};

// -----------------------------
// SAVE TO LOCAL STORAGE
// -----------------------------
function persistSearchState(state) {
  localStorage.setItem("searchState", JSON.stringify(state.searchState));
}

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
      return rejectWithValue(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message
      );
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
      const res = await API.get(`/candidates/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message
      );
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
      return rejectWithValue(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message
      );
    }
  }
);

// -------------------------------------------------------------
// DOWNLOAD RESUME
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
      return rejectWithValue({
        candidateId,
        message:
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Download failed",
      });
    }
  }
);
// -------------------------------------------------------------
// VIEW RESUME
// -------------------------------------------------------------
export const viewResumeThunk = createAsyncThunk(
  "recruiter/downloadResume",
  async (candidateId, { rejectWithValue }) => {
    try {
      const res = await API.get(`/candidates/${candidateId}/resume`);

      return {
        candidateId,
        url: res.data.resumeUrl,
      };
    } catch (err) {
      return rejectWithValue({
        candidateId,
        message:
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Download failed",
      });
    }
  }
);



// -------------------------------------------------------------
// SLICE
// -------------------------------------------------------------
const recruiterSlice = createSlice({
  name: "recruiter",
  initialState, // ⭐ USE THE CORRECT MERGED INITIAL STATE

  reducers: {
    resetCandidateState(state) {
      state.candidateLoading = false;
      state.candidateError = null;
      state.candidateData = null;
    },

    // ⭐ Save search state when clicking View Profile
    setSearchState(state, action) {
      state.searchState = action.payload;
      persistSearchState(state);
    },

    // ⭐ Reset search filters & UI
    resetSearchState(state) {
      state.searchState = {
        filters: {
          searchText: "",
          location: "",
          minExp: "",
          maxExp: "",
          designation: "",
          skills: [],
        },
        page: 1,
        size: 20,
        showResults: false,
      };

      state.searchResults = [];
      state.searchTotal = 0;
      persistSearchState(state);
    },

    clearDownloadError(state, action) {
      delete state.downloadErrors[action.payload];
    },
  },

  extraReducers: (builder) => {
    builder
      // -------------------- SEARCH --------------------
      .addCase(searchCandidates.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchCandidates.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.results || [];
        state.searchTotal = action.payload.total || 0;
        persistSearchState(state);
      })
      .addCase(searchCandidates.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload;
      })

      // -------------------- CANDIDATE DETAIL --------------------
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

      // -------------------- FEEDBACK UPDATE --------------------
      .addCase(updateCandidateFeedback.pending, (state) => {
        state.feedbackUpdating = true;
      })
      .addCase(updateCandidateFeedback.fulfilled, (state, action) => {
        state.feedbackUpdating = false;
      })
      .addCase(updateCandidateFeedback.rejected, (state, action) => {
        state.feedbackUpdating = false;
        state.feedbackError = action.payload;
      })

      // -------------------- RESUME DOWNLOAD --------------------
      .addCase(downloadResumeThunk.pending, (state, action) => {
        const id = action.meta.arg;
        state.downloading[id] = true;
        delete state.downloadErrors[id];
      })
      .addCase(downloadResumeThunk.fulfilled, (state, action) => {
        const { candidateId, url } = action.payload;
        delete state.downloading[candidateId];
        delete state.downloadErrors[candidateId];

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
        state.downloadErrors[candidateId] = message;
      });
  },
});

// -----------------------------
// EXPORT ACTIONS & REDUCER
// -----------------------------
export const {
  resetCandidateState,
  resetSearchState,
  setSearchState,
  clearDownloadError,
} = recruiterSlice.actions;

export default recruiterSlice.reducer;
