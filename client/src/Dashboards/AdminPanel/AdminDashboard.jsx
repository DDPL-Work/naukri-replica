// AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import {
  FiUser,
  FiPlusSquare,
  FiCalendar,
  FiSearch,
  FiDownload,
  FiChevronRight,
  FiEye,
  FiLogIn,
  FiActivity,
} from "react-icons/fi";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchAnalytics,
  listRecruiters,
} from "../../features/slices/adminSlice.js";
import { fetchRecruiterLogs } from "../../features/slices/recruiterLogSlice.js";
import API from "../../API/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { analyticsData, recruiterCount } = useSelector(
    (state) => state.admin
  );

  const { logs, loading: logsLoading } = useSelector(
    (state) => state.recruiterLogs
  );

  // Local Cache for candidate names
  const [candidateCache, setCandidateCache] = useState({});

  // Fetch Analytics + Recruiter Count + Logs
  useEffect(() => {
    dispatch(fetchAnalytics());
    dispatch(listRecruiters());
    dispatch(fetchRecruiterLogs());
  }, [dispatch]);

  // Fetch candidate name for logs
  const fetchCandidateName = async (id) => {
    if (!id || candidateCache[id]) return;

    try {
      const res = await API.get(`/candidates/${id}`);

      setCandidateCache((prev) => ({
        ...prev,
        [id]: {
          name: res.data?.name || "Unknown",
          jobTitle: res.data?.jobTitle || "",
        },
      }));
    } catch (error) {
      setCandidateCache((prev) => ({
        ...prev,
        [id]: {
          name: "Unknown",
          jobTitle: "",
        },
      }));
    }
  };

  // =============================
  // Format Log Details
  // =============================
  const formatLogDetails = (log) => {
    const details = log.details;

    // Case 1: Candidate View or Download
    if (details?.params?.id) {
      const id = details.params.id;

      if (!candidateCache[id]) {
        fetchCandidateName(id);
        return "Loading candidate...";
      }

      const { name, jobTitle } = candidateCache[id];

      const cleanJobTitle = jobTitle ? ` (${jobTitle})` : "";

      let label = "Candidate";
      if (log.action === "resume_download") label = "Resume Downloaded";
      if (log.action === "view_candidate") label = "Viewed Candidate";

      return `${label}: ${name}${cleanJobTitle}`;
    }

    // Case 2: Search logs
    if (details?.query?.q) {
      return `Search: ${details.query.q}`;
    }

    // Fallback
    return JSON.stringify(details);
  };

  // =============================
  // Log Icon Mapper
  // =============================
  const getLogIcon = (action) => {
    action = action?.toLowerCase() || "";

    if (action.includes("search")) return <FiSearch />;
    if (action.includes("view")) return <FiEye />;
    if (action.includes("download")) return <FiDownload />;
    if (action.includes("login")) return <FiLogIn />;
    return <FiActivity />;
  };

  // Capitalize action text
  const formatActionText = (action) =>
    action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const recentLogs = logs.slice(0, 5);

  return (
    <div className="p-8 w-full">
      {/* HEADER */}
      <h1 className="text-black text-4xl font-bold font-serif leading-[60px]">
        Welcome back, Admin!
      </h1>

      <p className="text-zinc-500 text-xl font-[Calibri] mt-1 mb-8">
        Here’s an overview of your candidate portal.
      </p>

      {/* ================== TOP CARDS ================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <DashboardCard
          icon={<FiUser />}
          title="Total Candidates"
          value={analyticsData?.totalCandidates || 0}
        />

        <DashboardCard
          icon={<FiPlusSquare />}
          title="New Today"
          value={analyticsData?.todayCount || 0}
          sub="Today"
        />

        <DashboardCard
          icon={<FiCalendar />}
          title="New This Week"
          value={analyticsData?.last7Count || 0}
        />

        <DashboardCard
          icon={<FiUser />}
          title="Total Recruiters"
          value={recruiterCount || 0}
        />
      </div>

      {/* SECOND ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <DashboardCard
          icon={<FiSearch />}
          title="Searches Today"
          value={analyticsData?.searchesToday || 0}
        />

        <DashboardCard
          icon={<FiDownload />}
          title="Downloads Today"
          value={analyticsData?.downloadsToday || 0}
        />
      </div>

      {/* ================== RECENT ACTIVITY ================== */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4">
          <h2 className="text-lg font-bold font-[Calibri] text-black">
            Recent Activity
          </h2>

          <button
            onClick={() => navigate("/admin/activity-logs")}
            className="text-blue-900 text-sm font-[Calibri] flex items-center gap-1 hover:underline"
          >
            View all <FiChevronRight />
          </button>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-[#103c7f] text-white text-sm">
              <th className="py-3 px-6 text-left">Time</th>
              <th className="py-3 px-3 text-left">Recruiter</th>
              <th className="py-3 px-3 text-left">Activity</th>
              <th className="py-3 px-3 text-left">Details</th>
            </tr>
          </thead>

          <tbody className="text-gray-700 text-sm">
            {logsLoading ? (
              <tr>
                <td colSpan="4" className="text-center py-5 text-zinc-500">
                  Loading logs...
                </td>
              </tr>
            ) : recentLogs.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-5 text-zinc-500">
                  No recent activity found.
                </td>
              </tr>
            ) : (
              recentLogs.map((log, i) => (
                <ActivityRow
                  key={i}
                  time={new Date(log.createdAt).toLocaleString()}
                  recruiter={log.recruiterId?.name || log.recruiterId?.email}
                  icon={getLogIcon(log.action)}
                  text={formatActionText(log.action)}
                  details={formatLogDetails(log)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ======================================================
   UI Components
======================================================= */

function DashboardCard({ icon, title, value, sub }) {
  return (
    <div className="border-2 border-gray-200 rounded-xl bg-[#10407e]/5 p-5 h-40 flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-black text-sm font-[Calibri] uppercase">{title}</p>
          <h2 className="text-blue-900 text-3xl font-bold font-[Calibri]">
            {value}
          </h2>

          {sub && (
            <p className="text-zinc-500 text-sm font-[Calibri] mt-1">{sub}</p>
          )}
        </div>

        <div className="bg-[#103c7f] text-white p-3 rounded-lg text-xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

export const ActivityRow = ({ time, recruiter, icon, text, details }) => (
  <tr className="border-b border-gray-200">
    <td className="py-4 px-6">{time}</td>
    <td className="py-4 px-3">{recruiter}</td>

    <td className="py-4 px-3 flex items-center gap-2">
      <span className="text-lg text-[#103c7f]">{icon}</span>
      <span className="text-sky-900 text-sm cursor-pointer hover:underline">
        {text}
      </span>
    </td>

    <td className="py-4 px-3">{details}</td>
  </tr>
);
