import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../API/axiosInstance";

export const fetchRecruiterLogs = createAsyncThunk(
  "recruiterLogs/fetchRecruiterLogs",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("/recruiter/logs");
      return res.data.logs;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to fetch recruiter logs");
    }
  }
);

const recruiterLogSlice = createSlice({
  name: "recruiterLogs",
  initialState: {
    logs: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecruiterLogs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRecruiterLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
      })
      .addCase(fetchRecruiterLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default recruiterLogSlice.reducer;
