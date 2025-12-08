// src/pages/Recruiter/ActivityLogsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  FiLogIn,
  FiSearch,
  FiEye,
  FiDownload,
  FiActivity,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { fetchRecruiterLogs } from "../../features/slices/recruiterLogSlice";
import API from "../../API/axiosInstance";

const ACTION_MAP = {
  search_candidates: { label: "Search", icon: <FiSearch /> },
  view_candidate: { label: "View", icon: <FiEye /> },
  resume_download: { label: "Download", icon: <FiDownload /> },
  login: { label: "Login", icon: <FiLogIn /> },
};

const TAG_CLASS = {
  search: "border border-zinc-200 text-black text-xs font-bold px-2.5 py-0.5 rounded-full",
  view: "border border-zinc-200 text-black text-xs font-bold px-2.5 py-0.5 rounded-full",
  download: "bg-blue-900 text-white text-xs font-bold px-2.5 py-0.5 rounded-full",
  login: "bg-gray-100 text-black text-xs font-bold px-2.5 py-0.5 rounded-full",
  other: "border border-zinc-200 text-black text-xs font-bold px-2.5 py-0.5 rounded-full",
};

export default function ActivityLogsPage() {
  const dispatch = useDispatch();
  const { logs = [], loading, error } = useSelector(
    (state) => state.recruiterLogs
  );

  // UI state
  const [activityType, setActivityType] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // candidate cache for name/title lookups
  const [candidateCache, setCandidateCache] = useState({});

  useEffect(() => {
    dispatch(fetchRecruiterLogs());
  }, [dispatch]);

  // reset to first page when filters change or logs update
  useEffect(() => {
    setPage(1);
  }, [activityType, fromDate, toDate, logs.length]);

  const getTypeFromAction = (action = "") => {
    const a = action.toLowerCase();
    if (a.includes("search")) return "search";
    if (a.includes("view")) return "view";
    if (a.includes("download")) return "download";
    if (a.includes("login")) return "login";
    return "other";
  };

  const friendlyActionLabel = (action) => {
    if (ACTION_MAP[action]) return ACTION_MAP[action].label;
    return action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Candidate lookup (caching)
  const fetchCandidate = async (id) => {
    if (!id) return null;
    if (candidateCache[id]) return candidateCache[id];

    try {
      const res = await API.get(`/candidates/${id}?noLog=true`);
      const data = res.data || {};
      // Accept different shapes (some endpoints return { candidate } or direct)
      const candidate = data.candidate || data;
      const name = candidate.fullName || candidate.name || "Unknown Candidate";
      const title = candidate.designation || candidate.jobTitle || "";
      const formatted = { name, title };
      setCandidateCache((prev) => ({ ...prev, [id]: formatted }));
      return formatted;
    } catch (err) {
      const fallback = { name: "Unknown Candidate", title: "" };
      setCandidateCache((prev) => ({ ...prev, [id]: fallback }));
      return fallback;
    }
  };

  // Client-side filtering
  const filteredLogs = useMemo(() => {
    if (!logs || logs.length === 0) return [];

    return logs.filter((log) => {
      // Activity type filter
      if (activityType !== "all") {
        const t = getTypeFromAction(log.action);
        if (t !== activityType) return false;
      }

      // Date filters (log.createdAt is assumed ISO string)
      if (fromDate) {
        const from = new Date(fromDate);
        const logDate = new Date(log.createdAt);
        if (logDate < from) return false;
      }
      if (toDate) {
        // include entire day for toDate
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        const logDate = new Date(log.createdAt);
        if (logDate > to) return false;
      }

      return true;
    });
  }, [logs, activityType, fromDate, toDate]);

  const total = filteredLogs.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const pageLogs = filteredLogs.slice(startIndex, startIndex + pageSize);

  // Format details with candidate name resolution
  const formatDetails = (details, action) => {
    if (!details) return "-";
    if (typeof details === "string") return details;

    // If details.params.id exists, it's a candidate action
    if (details.params?.id) {
      const id = details.params.id;
      const cached = candidateCache[id];
      if (!cached) {
        // start fetch in background
        fetchCandidate(id);
        return <span className="text-xs text-zinc-500">Loading candidate…</span>;
      }

      const label =
        action === "resume_download"
          ? "Downloaded Resume"
          : action === "view_candidate"
          ? "Viewed Candidate"
          : "Candidate";

      return (
        <div className="text-xs text-zinc-600">
          <strong className="text-black">{label}:</strong>{" "}
          <span className="text-blue-900 font-semibold">{cached.name}</span>
          {cached.title && <span className="text-zinc-500"> ({cached.title})</span>}
        </div>
      );
    }

    // If search query present
    if (details.query) {
      const q = details.query;
      return (
        <div className="text-xs text-zinc-600 space-y-1">
          {q.q && (
            <div>
              <strong className="text-black">Search:</strong> {q.q}
            </div>
          )}
          {q.location && (
            <div>
              <strong className="text-black">Location:</strong> {q.location}
            </div>
          )}
          {Array.isArray(q.skills) && q.skills.length > 0 && (
            <div>
              <strong className="text-black">Skills:</strong> {q.skills.join(", ")}
            </div>
          )}
          {q.minExp && (
            <div>
              <strong className="text-black">Min Exp:</strong> {q.minExp} yrs
            </div>
          )}
          {q.maxExp && (
            <div>
              <strong className="text-black">Max Exp:</strong> {q.maxExp} yrs
            </div>
          )}
        </div>
      );
    }

    // default fallback
    return (
      <div className="text-xs text-zinc-600">
        {Object.entries(details).map(([k, v]) => (
          <div key={k}>
            <strong className="text-black capitalize">{k}:</strong>{" "}
            {typeof v === "object" ? JSON.stringify(v) : String(v)}
          </div>
        ))}
      </div>
    );
  };

  // Render helpers
  const getIconForType = (type) => {
    switch (type) {
      case "login":
        return <FiLogIn className="text-blue-900" />;
      case "search":
        return <FiSearch className="text-blue-900" />;
      case "view":
        return <FiEye className="text-blue-900" />;
      case "download":
        return <FiDownload className="text-white" />; // white on blue tag
      default:
        return <FiActivity className="text-blue-900" />;
    }
  };

  return (
    <div className="w-full min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-black">Activity logs</h1>
          <p className="text-zinc-500 mt-1">
            Track your search history and profile interactions
          </p>
        </div>

        {/* FILTER CARD */}
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
          <h3 className="text-sm font-semibold mb-4">Filter Logs</h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Activity Type */}
            <div>
              <label className="block text-xs text-zinc-600 mb-2">Activity Type</label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All activities</option>
                <option value="search">Search</option>
                <option value="view">View</option>
                <option value="download">Download</option>
                <option value="login">Login</option>
              </select>
            </div>

            {/* From Date */}
            <div>
              <label className="block text-xs text-zinc-600 mb-2">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-sm"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-xs text-zinc-600 mb-2">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-sm"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  // apply filters — already applied by state
                  setPage(1);
                }}
                className="px-4 py-2 bg-blue-900 text-white rounded-md text-sm"
              >
                Apply
              </button>

              <button
                onClick={() => {
                  setActivityType("all");
                  setFromDate("");
                  setToDate("");
                  setPage(1);
                }}
                className="px-4 py-2 border border-zinc-200 rounded-md text-sm"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* LOG TABLE CARD */}
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
          {/* header row */}
          <div className="grid grid-cols-4 gap-4 bg-zinc-100 px-4 py-3 rounded-md text-sm font-medium text-zinc-800">
            <div className="flex items-center gap-3">Type</div>
            <div>Action</div>
            <div>Details</div>
            <div className="text-right">Timestamp</div>
          </div>

          {/* rows */}
          <div className="mt-4 space-y-3">
            {loading && (
              <div className="py-6 text-center text-zinc-500">Loading logs...</div>
            )}

            {!loading && pageLogs.length === 0 && (
              <div className="py-6 text-center text-zinc-500">No logs found.</div>
            )}

            {pageLogs.map((log, idx) => {
              const type = getTypeFromAction(log.action);
              return (
                <div
                  key={`${log._id || idx}-${log.createdAt}`}
                  className="grid grid-cols-4 gap-4 items-start py-3 border-b border-zinc-100"
                >
                  {/* Type + pill */}
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center
                      ${type === "download" ? "bg-blue-900 text-white" : ""}`}>
                      {getIconForType(type)}
                    </div>

                    <div className={TAG_CLASS[type] || TAG_CLASS.other}>
                      {type}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="text-blue-900 font-medium text-sm">
                    {friendlyActionLabel(log.action)}
                  </div>

                  {/* Details */}
                  <div>{formatDetails(log.details, log.action)}</div>

                  {/* Timestamp */}
                  <div className="text-right text-xs text-zinc-500">
                    {log.createdAt
                      ? new Date(log.createdAt).toLocaleString()
                      : log.timestamp || "-"}
                  </div>
                </div>
              );
            })}
          </div>

          {/* pagination footer */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-zinc-600">
              Showing{" "}
              <strong className="text-black">
                {total === 0 ? 0 : startIndex + 1}
              </strong>{" "}
              to <strong className="text-black">{endIndex}</strong> of{" "}
              <strong className="text-black">{total}</strong> entries
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`px-3 py-1 rounded-md text-sm ${
                  page === 1
                    ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                    : "bg-white border border-zinc-200 text-black"
                }`}
              >
                Prev
              </button>

              {/* page numbers (condensed) */}
              <div className="hidden sm:flex items-center gap-2 px-2">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  // show only first, last, current ±1
                  const show =
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    Math.abs(pageNum - page) <= 1;
                  if (!show) {
                    // insert ellipsis where appropriate
                    const before = page - 2;
                    const after = page + 2;
                    if (pageNum === before || pageNum === after) {
                      return <span key={pageNum}>...</span>;
                    }
                    return null;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-1 rounded-md text-sm ${
                        pageNum === page
                          ? "bg-blue-900 text-white"
                          : "bg-white border border-zinc-200 text-black"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`px-3 py-1 rounded-md text-sm ${
                  page === totalPages
                    ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                    : "bg-white border border-zinc-200 text-black"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
