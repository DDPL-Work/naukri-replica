import { createBrowserRouter } from "react-router-dom";
import Layout from "../Layout/Layout";
import RecruiterDashboard from "../Dashboards/RecruiterPanel/RecruiterDashboard";
import CandidateSearch from "../Dashboards/RecruiterPanel/CandidateSearch";
import CandidateProfilePage from "../Dashboards/RecruiterPanel/CandidateFullProfile";
import ActivityLogsPage from "../Dashboards/RecruiterPanel/ActivityLogs";
import AdminDashboard from "../Dashboards/AdminPanel/AdminDashboard";
import Login from "../pages/Auth/Login";
import ProtectedRoute from "./ProtectedRoute";
import RecruiterManagement from "../Dashboards/AdminPanel/ManageRecruiter";
import AddRecruiterForm from "../components/AdminComponents/AddRecruiterForm";
import EditRecruiter from "../components/AdminComponents/EditRecruiter";
import Analytics from "../Dashboards/AdminPanel/Analytics";
import BulkUpload from "../Dashboards/AdminPanel/BulkUpload";
import AdminActivityLogsPage from "../Dashboards/AdminPanel/ActivityLogs";
import AddCandidateManually from "../Dashboards/AdminPanel/AddCandidateManually";

export const appRouter = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      // Recruiter Routes
      {
        path: "/recruiter/dashboard",
        element: <RecruiterDashboard />,
      },
      {
        path: "/recruiter/candidate-search",
        element: <CandidateSearch />,
      },
      {
        path: "/recruiter/candidate-profile/:id",
        element: <CandidateProfilePage />,
      },
      {
        path: "/recruiter/activity-logs",
        element: <ActivityLogsPage />,
      },

      // Admin Routes
      {
        path: "/admin/dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "/admin/recruiter-management",
        element: <RecruiterManagement />,
      },
      {
        path: "/admin/recruiter-management/add",
        element: <AddRecruiterForm />,
      },
      {
        path: "/admin/recruiter-management/edit/:id",
        element: <EditRecruiter />,
      },
      {
        path: "/admin/analytics",
        element: <Analytics />,
      },
      {
        path: "/admin/bulk-upload",
        element: <BulkUpload />,
      },
      {
        path: "/admin/activity-logs",
        element: <AdminActivityLogsPage />,
      },
      {
        path: "/admin/add-candidate",
        element: <AddCandidateManually />,
      },
    ],
  },
  {
    path: "*",
    element: <Login />,
  },
]);
