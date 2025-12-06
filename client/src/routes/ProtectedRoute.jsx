import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem("token");
  const location = useLocation();

  // Not logged in → redirect to login
  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode(token);
    const userRole = decoded.role?.toLowerCase(); // "recruiter" | "admin"

    // USER ALLOWED PATHS
    const recruiterPaths = [
      "/recruiter/dashboard",
      "/recruiter/candidate-search",
      "/recruiter/candidate-profile/:id",
      "/recruiter/activity-logs",
    ];

    const adminPaths = [
      "/admin/dashboard",
      "/admin/recruiter-management",
      "/admin/recruiter-management/add",
      "/admin/recruiter-management/edit/:id",
      "/admin/analytics",
      "/admin/bulk-upload",
      "/admin/add-candidate",
      "/admin/activity-logs",
    ];

    const currentPath = location.pathname.toLowerCase();

    // ---- ACCESS CONTROL ---- //
    if (userRole === "RECRUITER" && !recruiterPaths.includes(currentPath)) {
      // If recruiter tries to access admin routes → redirect
      return <Navigate to="/recruiter/dashboard" replace />;
    }

    if (userRole === "ADMIN" && !adminPaths.includes(currentPath)) {
      // If admin tries to access recruiter routes → redirect
      return <Navigate to="/admin/dashboard" replace />;
    }

    // If valid, allow page
    return children;
  } catch (error) {
    // Invalid token → force logout
    sessionStorage.clear();
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
