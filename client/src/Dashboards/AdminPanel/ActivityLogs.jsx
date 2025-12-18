import React, { useMemo, useState, useEffect } from "react";
import {
  FiDownload,
  FiSearch,
  FiEye,
  FiLogIn,
  FiChevronDown,
  FiEdit3,
  FiUpload,
  FiPlus,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import API from "../../API/axiosInstance";
import { fetchRecruiterLogs } from "../../features/slices/recruiterLogSlice";
import { fetchAdminUploadLogs } from "../../features/slices/adminUploadLogSlice";
import { listRecruiters } from "../../features/slices/adminSlice";

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

  const header = ["Timestamp", "Actor", "Activity", "Details"];

  const csvContent = [
    header.join(","),
    ...rows.map((r) =>
      [
        `"${formatDateTime(r.createdAt)}"`,
        `"${r.recruiterId?.name || r.adminId?.name || "Unknown"} (${
          r.recruiterId?.email || r.adminId?.email || ""
        })"`,
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
   PRETTY LABEL
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
  if (a.includes("update")) return <FiEdit3 />;
  if (a.includes("login")) return <FiLogIn />;
  if (a.includes("logout")) return <FiLogIn />;
  if (a.includes("upload")) return <FiUpload />;
  if (a.includes("add_candidate")) return <FiPlus />;
  if (a.includes("create_recruiter")) return <FiPlus />;

  return <FiEye />;
};

/* ------------------------------------------------
   BADGE COLORS
-------------------------------------------------- */
const activityColorClass = (action) => {
  if (!action) return "bg-gray-200 text-gray-700";

  const a = action.toLowerCase();

  if (a.includes("search")) return "bg-blue-100 text-blue-700";
  if (a.includes("view")) return "bg-purple-100 text-purple-700";
  if (a.includes("download")) return "bg-green-100 text-green-700";
  if (a.includes("update")) return "bg-orange-100 text-orange-700";
  if (a.includes("login")) return "bg-red-100 text-red-700";
  if (a.includes("logout")) return "bg-gray-300 text-gray-900";
  if (a.includes("upload")) return "bg-teal-100 text-teal-700";
  if (a.includes("add_candidate")) return "bg-blue-600 text-white";
  if (a.includes("create_recruiter")) return "bg-yellow-300 text-teal-800";

  return "bg-gray-200 text-gray-700";
};

/* ------------------------------------------------
   MAIN COMPONENT
-------------------------------------------------- */
export default function AdminActivityLogsPage() {
  const dispatch = useDispatch();

  const {
    logs: recruiterLogs,
    loading: recruiterLoading,
    error: recruiterError,
  } = useSelector((state) => state.recruiterLogs);
  const {
    logs: adminUploadLogs,
    loading: adminUploadLoading,
    error: adminUploadError,
  } = useSelector((state) => state.adminUploadLogs);
  const { recruiters } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchRecruiterLogs());
    dispatch(fetchAdminUploadLogs());
    dispatch(listRecruiters());
  }, [dispatch]);

  /* ------------------------------------------
     MERGE LOGS FROM BOTH SLICES
  ------------------------------------------ */
  const combinedLogs = useMemo(() => {
    const recruiterLogsWithSource = (recruiterLogs || []).map((log) => ({
      ...log,
      action: log.action?.toLowerCase(), // 🔥 normalize here
      logSource: "recruiter",
    }));

    const adminLogsWithSource = (adminUploadLogs || []).map((log) => ({
      ...log,
      action: log.action?.toLowerCase(), // 🔥 normalize here
      logSource: "admin",
      recruiterId: {
        ...log.adminId,
        role: "ADMIN",
      },
    }));

    // Combine and sort by timestamp (newest first)
    return [...recruiterLogsWithSource, ...adminLogsWithSource].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    });
  }, [recruiterLogs, adminUploadLogs]);

  /* ------------------------------------------
     CANDIDATE NAME CACHE
  ------------------------------------------ */
  const [candidateCache, setCandidateCache] = useState({});

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
    } catch {
      setCandidateCache((prev) => ({
        ...prev,
        [id]: { name: "Unknown", jobTitle: "" },
      }));
    }
  };

  /* ------------------------------------------------
     FORMAT DETAILS WITH BEAUTIFICATION
  -------------------------------------------------- */
  const formatDetails = (details, action) => {
    if (!details || typeof details !== "object") return "-";

    /* Candidate access */
    if (details.params?.id) {
      const id = details.params.id;

      if (!candidateCache[id]) {
        fetchCandidateName(id);
        return <div className="text-xs text-zinc-500 italic">Loading…</div>;
      }

      const { name, jobTitle } = candidateCache[id];

      return (
        <div className="text-xs text-zinc-800 space-y-1">
          <span className="font-semibold">
            {action === "resume_download"
              ? "Downloaded Resume:"
              : "Viewed Candidate:"}
          </span>
          <span className="text-blue-700 font-semibold"> {name}</span>
          {jobTitle && <span className="text-zinc-500"> ({jobTitle})</span>}
        </div>
      );
    }

    /* Search logs beautified */
    if (details.query) {
      const q = details.query;
      return (
        <div className="text-xs text-zinc-800 space-y-1">
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

    /* Admin upload logs beautified */
    if (details.fileName) {
      return (
        <div className="text-xs text-zinc-800 space-y-1">
          <span className="font-semibold">Uploaded File:</span>
          <span className="text-blue-700 font-semibold">
            {" "}
            {details.fileName}
          </span>
          {details.candidatesCount !== undefined && (
            <span className="text-zinc-500">
              {" "}
              ({details.candidatesCount} candidates)
            </span>
          )}
        </div>
      );
    }

    if (action === "create_recruiter" && details?.name && details?.email) {
      return (
        <div className="text-xs text-zinc-800 space-y-1">
          <div className="flex items-center gap-1 font-semibold text-teal-700">
            <FiPlus className="text-sm" />
            Recruiter Created
          </div>

          <div>
            <span className="font-semibold text-zinc-600">Name:</span>{" "}
            <span className="text-zinc-900">{details.name}</span>
          </div>

          <div>
            <span className="font-semibold text-zinc-600">Email:</span>{" "}
            <span className="text-blue-700">{details.email}</span>
          </div>

          {details.dailyDownloadLimit !== undefined && (
            <div className="text-zinc-500">
              Daily Download Limit:{" "}
              <span className="font-semibold text-zinc-700">
                {details.dailyDownloadLimit}
              </span>
            </div>
          )}
        </div>
      );
    }

    /* ------------------------------------------------
      ADMIN – ADD CANDIDATE (MANUAL)
    -------------------------------------------------- */
    if (action === "add_candidate" && details.name && details.email) {
      return (
        <div className="text-xs text-zinc-800 space-y-1">
          <div className="flex items-center gap-1 font-semibold">
            <FiPlus className="text-sm" />
            Candidate Added
          </div>

          <div>
            <span className="font-semibold  text-blue-700">Name:</span>{" "}
            {details.name}
          </div>

          <div>
            <span className="font-semibold  text-blue-700">Email:</span>{" "}
            {details.email}
          </div>

          {details.source && (
            <div className="text-zinc-500 ">Source: {details.source}</div>
          )}
        </div>
      );
    }

    if (action === "login")
      return (
        <div className="text-xs">
          <span className="font-semibold">Status:</span> Logged In
        </div>
      );

    if (action === "logout")
      return (
        <div className="text-xs">
          <span className="font-semibold">Status:</span> Logged Out
        </div>
      );

    /* Pretty fallback JSON */
    return (
      <pre className="text-xs bg-gray-50 p-2 rounded whitespace-pre-wrap border">
        {JSON.stringify(details, null, 2)}
      </pre>
    );
  };

  /* ------------------------------------------------
     FILTERS (USING RECRUITER OBJECTS)
  -------------------------------------------------- */

  const recruiterOptions = useMemo(() => {
    if (!recruiters) return [];
    return [
      { label: "All Recruiters", value: "all" },
      ...recruiters.map((r) => ({
        label: `${r.name} (${r.email})`,
        value: r._id,
      })),
    ];
  }, [recruiters]);

  const [recruiterFilter, setRecruiterFilter] = useState("all");
  const [actorFilter, setActorFilter] = useState("ALL");
  const [activityFilter, setActivityFilter] = useState("All Activity");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* ------------------------------------------------
     FILTERING LOGS
  -------------------------------------------------- */
  const filteredRows = combinedLogs.filter((row) => {
    // 🔹 Actor filter - Filter by log source and role (HIGHEST PRIORITY)
    if (actorFilter === "RECRUITER") {
      // Show ALL recruiter logs when "Recruiter Actions" is selected
      // Check both logSource and role to be safe
      const isRecruiterLog =
        row.logSource === "recruiter" ||
        (row.recruiterId && row.recruiterId.role === "RECRUITER");

      if (!isRecruiterLog) {
        return false;
      }

      // Then apply specific recruiter filter if selected
      if (
        recruiterFilter !== "all" &&
        row.recruiterId?._id !== recruiterFilter
      ) {
        return false;
      }
    } else if (actorFilter === "ADMIN") {
      // Show ALL admin logs when "Admin Actions" is selected
      const isAdminLog =
        row.logSource === "admin" ||
        (row.recruiterId && row.recruiterId.role === "ADMIN");

      if (!isAdminLog) {
        return false;
      }
    }
    // If actorFilter === "ALL", show both recruiters and admins

    // 🔹 Activity filter
    if (activityFilter !== "All Activity" && row.action !== activityFilter) {
      return false;
    }

    // 🔹 Date filter
    const d = row.createdAt?.slice(0, 10);
    if (fromDate && d < fromDate) return false;
    if (toDate && d > toDate) return false;

    return true;
  });

  /* ------------------------------------------------
     Pagination
  -------------------------------------------------- */
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredRows.length / ITEMS_PER_PAGE);
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const resetFilters = () => {
    setRecruiterFilter("all");
    setActorFilter("ALL");
    setActivityFilter("All Activity");
    setFromDate("");
    setToDate("");
  };

  /* ------------------------------------------------
     UI RENDER
  -------------------------------------------------- */
  const loading = recruiterLoading || adminUploadLoading;
  const error = recruiterError || adminUploadError;

  if (loading) return <div className="p-10 text-center text-xl">Loading…</div>;

  if (error)
    return (
      <div className="p-10 text-center text-xl text-red-600">
        Failed to load logs: {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-white px-10 py-8">
      <h1 className="text-4xl font-serif font-bold">Activity Logs</h1>
      <p className="text-gray-500 text-lg mt-1 mb-6">
        Track all admin and recruiter activities
      </p>

      {/* FILTER BAR */}
      <div className="border border-gray-200 rounded-xl p-4 mb-6 bg-white">
        <div className="flex flex-wrap gap-4">
          {/* Recruiter Filter */}
          <div className="relative w-56">
            <select
              value={recruiterFilter}
              onChange={(e) => setRecruiterFilter(e.target.value)}
              disabled={actorFilter === "ADMIN"}
              className={`appearance-none bg-[#FAFAF9] border border-gray-300 rounded-md px-4 pr-10 py-2 text-sm w-full ${
                actorFilter === "ADMIN" ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {recruiterOptions.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
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
              {[
                "All Activity",
                ...new Set(combinedLogs.map((l) => l.action)),
              ].map((a) => (
                <option key={a} value={a}>
                  {prettyActivity(a)}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-3 text-gray-500" />
          </div>
          {/* Actor Filter */}
          <div className="relative w-44">
            <select
              value={actorFilter}
              onChange={(e) => {
                setActorFilter(e.target.value);
                if (e.target.value === "ADMIN") {
                  setRecruiterFilter("all"); // reset recruiter filter
                }
              }}
              className="appearance-none bg-[#FAFAF9] border border-gray-300 rounded-md px-4 pr-10 py-2 text-sm w-full"
            >
              <option value="ALL">All Actions</option>
              <option value="RECRUITER">Recruiter Actions</option>
              <option value="ADMIN">Admin Actions</option>
            </select>
            <FiChevronDown className="absolute right-3 top-3 text-gray-500" />
          </div>

          {/* Dates */}
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

          {(recruiterFilter !== "all" ||
            activityFilter !== "All Activity" ||
            fromDate ||
            toDate) && (
            <button onClick={resetFilters} className="text-blue-600 text-sm">
              Reset
            </button>
          )}

          {/* CSV Export */}
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
        <div className="bg-[#0D3B66] text-white text-sm font-semibold grid grid-cols-[13rem_15rem_16rem_1fr] py-3 px-4">
          <div>TIMESTAMP</div>
          <div>ACTOR</div>
          <div>ACTIVITY</div>
          <div>DETAILS</div>
        </div>

        {paginatedRows.map((row, i) => (
          <div
            key={row._id || i}
            className="grid grid-cols-[13rem_15rem_16rem_1fr] border-b border-gray-200 py-4 px-4 text-sm"
          >
            <div>{formatDateTime(row.createdAt)}</div>

            <div>
              {row.recruiterId?.name}
              {row.recruiterId?.email && (
                <span className="text-gray-500 text-xs">
                  ({row.recruiterId.email})
                </span>
              )}

              {/* {row.recruiterId?.role === "ADMIN" && (
                <span className="ml-2 text-[10px] px-2 py-[2px] rounded-full bg-black text-white">
                  ADMIN
                </span>
              )} */}
            </div>

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
            onClick={() => setCurrentPage((p) => p - 1)}
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
            onClick={() => setCurrentPage((p) => p + 1)}
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
