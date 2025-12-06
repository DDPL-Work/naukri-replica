import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../API/axiosInstance.js";
import toast from "react-hot-toast";

/**
 * THUNK: Upload Bulk File
 */
export const uploadBulkFile = createAsyncThunk(
  "bulk/upload",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await API.post(
        "/bulk/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

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

const bulkSlice = createSlice({
  name: "bulk",
  initialState: {
    loading: false,
    success: false,
    error: null,
    result: null,
  },

  reducers: {
    resetBulkState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.result = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(uploadBulkFile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(uploadBulkFile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.result = action.payload;
        toast.success("Bulk upload completed successfully");
      })

      .addCase(uploadBulkFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Bulk upload failed";
        toast.error(state.error);
      });
  },
});

export const { resetBulkState } = bulkSlice.actions;
export default bulkSlice.reducer;
