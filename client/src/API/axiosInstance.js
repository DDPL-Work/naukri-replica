import axios from "axios";
import { store } from "../features/store";
import { logoutUser } from "../features/Slice/authSlice";

// Base URL for your backend
const API = axios.create({
  baseURL: "/api",  // Your backend prefix
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * REQUEST INTERCEPTOR
 * - Attach JWT token from sessionStorage
 */
API.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR
 * - Handle token expiry
 * - Auto logout on 401 Unauthorized
 */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status } = error.response || {};

    // Token expired or invalid
    if (status === 401) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      store.dispatch(logoutUser());

      window.location.href = "/login"; // force redirect
    }

    return Promise.reject(error);
  }
);

export default API;
