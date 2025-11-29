import { createBrowserRouter } from "react-router-dom";
import Layout from "../Layout/Layout";
import RecruiterDashboard from "../Dashboards/RecruiterPanel/RecruiterDashboard";
import CandidateSearch from "../Dashboards/RecruiterPanel/CandidateSearch";
import CandidateProfilePage from "../Dashboards/RecruiterPanel/CandidateFullProfile";

export const appRouter = createBrowserRouter([
  {
    path: "/login",
    // element: <Login />,
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <RecruiterDashboard />,
      },
      {
        path: "/candidate-search",
        element: <CandidateSearch />,
      },
      {
        path: "/candidate-profile",
        element: <CandidateProfilePage />,
      },
    ],
  },
]);
