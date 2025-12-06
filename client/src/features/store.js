// src/features/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import adminReducer from "./slices/adminSlice";
import bulkReducer from "./slices/bulkSlice";
import recruiterReducer from './slices/recruiterSlice.js';
import recruiterLogReducer from './slices/recruiterLogSlice.js'
import { setupAxiosInterceptors } from "../API/axiosInstance.js";


export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    bulk: bulkReducer,
    recruiter: recruiterReducer,
    recruiterLogs: recruiterLogReducer,
  },
});

// now that store exists, wire axios interceptors that need the store
setupAxiosInterceptors(store);

export default store;
