import { createBrowserRouter } from "react-router-dom";
import Layout from "../Layout/Layout";
import RecruiterDashboard from "../Dashboards/RecruiterPanel/RecruiterDashboard";
import CandidateSearch from "../Dashboards/RecruiterPanel/CandidateSearch";
import CandidateProfilePage from "../Dashboards/RecruiterPanel/CandidateFullProfile";
import ActivityLogsPage from "../Dashboards/RecruiterPanel/ActivityLogs";
import AdminDashboard from "../Dashboards/AdminPanel/AdminDashboard";
import Login from "../pages/Auth/Login";

export const appRouter = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <Layout />,
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
        path: "/recruiter/candidate-profile",
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
    ],
  },
]);
