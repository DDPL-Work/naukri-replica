import React, { useMemo, useState, useEffect } from "react";
import {
  FiDownload,
  FiSearch,
  FiEye,
  FiLogIn,
  FiChevronDown,
  FiEdit3,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import API from "../../API/axiosInstance";
import { fetchRecruiterLogs } from "../../features/slices/recruiterLogSlice";

/* ------------------------------------------------
   CLEAN TIMESTAMP
-------------------------------------------------- */
const formatDateTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/* ------------------------------------------------
   EXPORT CSV
-------------------------------------------------- */
function exportCSV(rows) {
  if (!rows.length) return;

  const header = ["Timestamp", "Recruiter", "Activity", "Details"];

  const csvContent = [
    header.join(","),
    ...rows.map((r) =>
      [
        `"${formatDateTime(r.createdAt)}"`,
        `"${r.recruiterId?.email || ""}"`,
        `"${r.action}"`,
        `"${JSON.stringify(r.details).replace(/"/g, '""')}"`,
      ].join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "activity_logs.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------
   FORMAT ACTIVITY TAG
-------------------------------------------------- */
const prettyActivity = (action) => {
  if (!action) return "Unknown";
  return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

/* ------------------------------------------------
   ICON SELECTION
-------------------------------------------------- */
const activityIcon = (action) => {
  if (!action) return <FiEye />;

  const a = action.toLowerCase();

  if (a.includes("search")) return <FiSearch />;
  if (a.includes("view")) return <FiEye />;
  if (a.includes("download")) return <FiDownload />;
  if (a.includes("update") || a.includes("remark")) return <FiEdit3 />;
  if (a.includes("login")) return <FiLogIn />;

  return <FiEye />;
};

/* ------------------------------------------------
   ACTIVITY COLOR TAG
-------------------------------------------------- */
const activityColorClass = (action) => {
  if (!action) return "bg-gray-200 text-gray-700";

  const a = action.toLowerCase();

  if (a.includes("search")) return "bg-blue-100 text-blue-700";
  if (a.includes("view")) return "bg-purple-100 text-purple-700";
  if (a.includes("download")) return "bg-green-100 text-green-700";
  if (a.includes("update")) return "bg-orange-100 text-orange-700";
  if (a.includes("login")) return "bg-red-100 text-red-700";

  return "bg-gray-200 text-gray-700";
};

/* ------------------------------------------------
   MAIN COMPONENT
-------------------------------------------------- */
export default function AdminActivityLogsPage() {
  const dispatch = useDispatch();
  const { logs, loading, error } = useSelector((state) => state.recruiterLogs);

  useEffect(() => {
    dispatch(fetchRecruiterLogs());
  }, [dispatch]);

  /* Local Cache for candidate names */
  const [candidateCache, setCandidateCache] = useState({});

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
    } catch (err) {
      setCandidateCache((prev) => ({
        ...prev,
        [id]: { name: "Unknown", jobTitle: "" },
      }));
    }
  };

  /* ------------------------------------------------
     FORMAT DETAILS CLEANLY (Same as Dashboard)
  -------------------------------------------------- */
  const formatDetails = (details, action) => {
    if (!details) return "-";

    // CASE 1: Candidate actions (view / download)
    if (details.params?.id) {
      const id = details.params.id;

      if (!candidateCache[id]) {
        fetchCandidateName(id);
        return "Loading candidate...";
      }

      const { name, jobTitle } = candidateCache[id];
      const cleanJob = jobTitle ? ` (${jobTitle})` : "";

      let label = "Candidate";
      if (action === "resume_download") label = "Resume Downloaded";
      if (action === "view_candidate") label = "Viewed Candidate";

      return `${label}: ${name}${cleanJob}`;
    }

    // CASE 2: Search logs
    if (details.query?.q) {
      return `Search: ${details.query.q}`;
    }

    // Fallback
    return JSON.stringify(details);
  };

  /* ------------------------------------------------
     FILTER STATES
  -------------------------------------------------- */
  const [recruiterFilter, setRecruiterFilter] = useState("All Recruiters");
  const [activityFilter, setActivityFilter] = useState("All Activity");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const recruiters = useMemo(() => {
    const setR = new Set(
      logs
        .filter((l) => l.recruiterId && l.recruiterId.role !== "ADMIN")
        .map((l) => l.recruiterId.email)
    );
    return ["All Recruiters", ...Array.from(setR)];
  }, [logs]);

  const activities = useMemo(() => {
    const setA = new Set(logs.map((l) => l.action));
    return ["All Activity", ...Array.from(setA)];
  }, [logs]);

  /* ------------------------------------------------
     FILTERING
  -------------------------------------------------- */
  const filteredRows = logs.filter((row) => {
    if (!row.recruiterId || row.recruiterId.role === "ADMIN") return false;

    if (
      recruiterFilter !== "All Recruiters" &&
      row.recruiterId.email !== recruiterFilter
    )
      return false;

    if (activityFilter !== "All Activity" && row.action !== activityFilter)
      return false;

    const date = row.createdAt?.slice(0, 10);
    if (fromDate && date < fromDate) return false;
    if (toDate && date > toDate) return false;

    return true;
  });

  /* ------------------------------------------------
     PAGINATION
  -------------------------------------------------- */
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredRows.length / ITEMS_PER_PAGE);
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const resetFilters = () => {
    setRecruiterFilter("All Recruiters");
    setActivityFilter("All Activity");
    setFromDate("");
    setToDate("");
  };

  /* ------------------------------------------------
     LOADING / ERROR
  -------------------------------------------------- */
  if (loading)
    return <div className="p-10 text-center text-xl">Loading...</div>;

  if (error)
    return (
      <div className="p-10 text-center text-xl text-red-600">
        Failed to load logs: {error}
      </div>
    );

  /* ------------------------------------------------
     UI STARTS HERE
  -------------------------------------------------- */
  return (
    <div className="min-h-screen bg-white px-10 py-8">
      <h1 className="text-4xl font-serif font-bold">Activity Logs</h1>
      <p className="text-gray-500 text-lg mt-1 mb-6">
        Track all recruiter activities
      </p>

      {/* FILTER BAR */}
      <div className="border border-gray-200 rounded-xl p-4 mb-5 bg-white">
        <div className="flex flex-wrap gap-4">

          {/* Recruiter Filter */}
          <div className="relative w-44">
            <select
              value={recruiterFilter}
              onChange={(e) => setRecruiterFilter(e.target.value)}
              className="appearance-none bg-[#FAFAF9] border border-gray-300 rounded-md px-4 pr-10 py-2 text-sm w-full"
            >
              {recruiters.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-3 text-gray-500" />
          </div>

          {/* Activity Filter */}
          <div className="relative w-44">
            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="appearance-none bg-[#FAFAF9] border border-gray-300 rounded-md px-4 pr-10 py-2 text-sm w-full"
            >
              {activities.map((a) => (
                <option key={a}>{prettyActivity(a)}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-3 text-gray-500" />
          </div>

          {/* Date Range */}
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="bg-[#FAFAF9] border border-gray-300 rounded-md px-4 py-2 text-sm w-44"
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="bg-[#FAFAF9] border border-gray-300 rounded-md px-4 py-2 text-sm w-44"
          />

          {/* Reset */}
          {(recruiterFilter !== "All Recruiters" ||
            activityFilter !== "All Activity" ||
            fromDate ||
            toDate) && (
            <button
              onClick={resetFilters}
              className="text-blue-600 text-sm hover:underline"
            >
              Reset
            </button>
          )}

          {/* Export */}
          <button
            onClick={() => exportCSV(filteredRows)}
            className="bg-lime-400 hover:bg-lime-500 px-5 py-2 rounded-md text-sm flex items-center gap-2"
          >
            Export CSV <FiDownload />
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-[#0D3B66] text-white text-sm font-semibold grid grid-cols-[13rem_12rem_16rem_1fr] py-3 px-4">
          <div>TIMESTAMP</div>
          <div>RECRUITER</div>
          <div>ACTIVITY</div>
          <div>DETAILS</div>
        </div>

        {/* Rows */}
        {paginatedRows.map((row, i) => (
          <div
            key={row._id || i}
            className="grid grid-cols-[13rem_12rem_16rem_1fr] border-b border-gray-200 py-4 px-4 text-sm"
          >
            <div>{formatDateTime(row.createdAt)}</div>

            <div>{row.recruiterId?.email || "Unknown"}</div>

            <div className="flex items-center gap-2">
              <span className="text-blue-700 text-base">
                {activityIcon(row.action)}
              </span>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${activityColorClass(
                  row.action
                )}`}
              >
                {prettyActivity(row.action)}
              </span>
            </div>

            <div>{formatDetails(row.details, row.action)}</div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center text-sm text-gray-600 mt-3">
        <p>
          Showing {paginatedRows.length} of {filteredRows.length} entries
        </p>

        <div className="flex gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => (p > 1 ? p - 1 : p))}
            className={`px-3 py-1 border rounded-md ${
              currentPage === 1 ? "opacity-40" : ""
            }`}
          >
            Previous
          </button>

          <span className="px-3 py-1 border rounded-md">
            Page {currentPage} / {totalPages || 1}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => (p < totalPages ? p + 1 : p))}
            className={`px-3 py-1 border rounded-md ${
              currentPage === totalPages ? "opacity-40" : ""
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
