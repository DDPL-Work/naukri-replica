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

  const { analyticsData, recruiterCount } = useSelector((state) => state.admin);

  const { logs, loading: logsLoading } = useSelector(
    (state) => state.recruiterLogs
  );

  const [candidateCache, setCandidateCache] = useState({});

  useEffect(() => {
    dispatch(fetchAnalytics());
    dispatch(listRecruiters());
    dispatch(fetchRecruiterLogs());
  }, [dispatch]);

  // Fetch candidate names
  const fetchCandidateName = async (id) => {
    if (!id || candidateCache[id]) return;

    try {
      const res = await API.get(`/candidates/${id}?noLog=true`);
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
        [id]: { name: "Unknown", jobTitle: "" },
      }));
    }
  };

  /* ================================================
     BEAUTIFIED LOG DETAILS
  ================================================= */
  const formatLogDetails = (log) => {
    const details = log.details;
    const action = log.action;

    // Candidate views / downloads
    if (details?.params?.id) {
      const id = details.params.id;

      if (!candidateCache[id]) {
        fetchCandidateName(id);
        return (
          <span className="text-xs text-gray-500 italic">
            Loading candidate...
          </span>
        );
      }

      const { name, jobTitle } = candidateCache[id];

      return (
        <div className="text-xs space-y-1">
          <div>
            <span className="font-semibold text-black">
              {action === "resume_download"
                ? "Downloaded Resume:"
                : "Viewed Candidate:"}
            </span>{" "}
            <span className="text-blue-900 font-semibold">{name}</span>
            {jobTitle && <span className="text-gray-500"> ({jobTitle})</span>}
          </div>
        </div>
      );
    }

    // Search logs
    if (details?.query) {
      const q = details.query;

      return (
        <div className="text-xs space-y-1 text-gray-700">
          {q.q && (
            <div>
              <span className="font-semibold">Search Text:</span> {q.q}
            </div>
          )}
          {q.location && (
            <div>
              <span className="font-semibold">Location:</span> {q.location}
            </div>
          )}
          {Array.isArray(q.skills) && q.skills.length > 0 && (
            <div>
              <span className="font-semibold">Skills:</span>{" "}
              {q.skills.join(", ")}
            </div>
          )}
        </div>
      );
    }

    // Login
    if (action === "login") {
      return (
        <div className="text-xs space-y-1">
          <div>
            <span className="font-semibold">Status:</span> Logged In
          </div>
        </div>
      );
    }

    // Logout
    if (action === "logout") {
      return (
        <div className="text-xs space-y-1">
          <div>
            <span className="font-semibold">Status:</span> Logged Out
          </div>
        </div>
      );
    }

    // Fallback JSON pretty formatting
    return (
      <pre className="text-xs bg-gray-50 p-2 rounded-md border border-gray-200 whitespace-pre-wrap">
        {JSON.stringify(details, null, 2)}
      </pre>
    );
  };

  /* ================================================
     ICON SELECTOR
  ================================================= */
  const getLogIcon = (action = "") => {
    const a = action.toLowerCase();

    if (a.includes("search")) return <FiSearch />;
    if (a.includes("view")) return <FiEye />;
    if (a.includes("download")) return <FiDownload />;
    if (a.includes("login")) return <FiLogIn />;
    if (a.includes("logout")) return <FiLogIn />;
    return <FiActivity />;
  };

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

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <DashboardCard
          icon={<FiUser />}
          title="Total Candidates"
          value={analyticsData?.totalCandidates || 0}
        />

        <DashboardCard
          icon={<FiPlusSquare />}
          title="New Candidates "
          value={analyticsData?.todayCount || 0}
          sub="Today"
        />

        <DashboardCard
          icon={<FiCalendar />}
          title="New Candidates"
          value={analyticsData?.last7Count || 0}
          sub="This Week"
        />

        <DashboardCard
          icon={<FiUser />}
          title="Total Recruiters"
          value={recruiterCount || 0}
        />
      </div>

      {/* RECENT ACTIVITY TABLE */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4">
          <h2 className="text-lg font-bold font-[Calibri] text-black">
            Recent Activity of Recruiters
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
