import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAnalytics } from "../../features/slices/adminSlice";

import { FaFileAlt, FaPlusCircle, FaChartBar } from "react-icons/fa";

// ======================================================================
// FIX: Tailwind grid-column class map
// ======================================================================
const GRID_CLASS = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

// ======================================================================
// REUSABLE METRIC CARD
// ======================================================================
const MetricCard = ({ title, value, subtitle, icon: Icon }) => (
  <div className="w-80 p-6 bg-blue-900/5 border border-blue-900/30 rounded-lg">
    <div className="flex justify-between">
      <div>
        <p className="text-black text-sm uppercase tracking-tight">{title}</p>

        <p className="text-blue-900 text-3xl font-bold">{value ?? "—"}</p>

        {subtitle && <p className="text-zinc-500 text-sm mt-1">{subtitle}</p>}
      </div>

      <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
        <Icon className="text-white text-2xl" />
      </div>
    </div>
  </div>
);

// ======================================================================
// REUSABLE TABLE SECTION
// ======================================================================
const TableSection = ({ title, columns, rows }) => {
  const gridClass = GRID_CLASS[columns.length] || "grid-cols-2";

  return (
    <div className="w-full mt-10 bg-white border border-zinc-200 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-zinc-200">
        <h2 className="text-black text-lg font-bold">{title}</h2>
      </div>

      {/* table header */}
      <div
        className={`bg-blue-900 px-12 py-3 text-white font-bold uppercase text-sm grid ${gridClass}`}
      >
        {columns.map((c, i) => (
          <span key={i}>{c}</span>
        ))}
      </div>

      {/* rows */}
      {rows.map((row, index) => (
        <div
          key={index}
          className={`px-12 py-3 grid ${gridClass} border-b border-zinc-200`}
        >
          {row.map((val, i) => (
            <span
              key={i}
              className={`text-sm ${
                i === 1 ? "text-blue-900 font-bold" : "text-black"
              }`}
            >
              {val}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};

// ======================================================================
// MAIN ANALYTICS PAGE
// ======================================================================
export default function Analytics() {
  const dispatch = useDispatch();

  const { analyticsLoading, analyticsError, analyticsData } = useSelector(
    (state) => state.admin
  );

  // FILTER STATE
  const [range, setRange] = useState("7d");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    dispatch(fetchAnalytics({ range }));
  }, [dispatch, range]);

  const {
    totalCandidates = "—",
    todayCount = "—",
    last7Count = "—",
    topLocations = [],
    topSkills = [],
    portalStats = [],
    topDesignations = [],
    experienceBuckets = [],
  } = analyticsData || {};

  // cleaned table rows
  const locationRows = topLocations.map((loc) => [
    (loc._id || "Unknown").split(",")[0].trim(),
    loc.count,
    "—",
  ]);

  const skillRows = topSkills.map((s) => [s._id ?? "Unknown", s.count]);

  const sourceRows = portalStats.map((p) => [p._id ?? "Unknown", p.count]);

  const jobRows = topDesignations.map((j) => [j._id ?? "Unknown", j.count]);

  const expRows = experienceBuckets.map((b) => {
    const label =
      b._id === 0
        ? "0 - 2 Years"
        : b._id === 2
        ? "2 - 5 Years"
        : b._id === 5
        ? "5 - 10 Years"
        : b._id === 10
        ? "10 - 20 Years"
        : b._id === 20
        ? "20+ Years"
        : "Unknown";

    return [label, b.count];
  });

  if (analyticsLoading) return <div className="p-6">Loading analytics...</div>;

  if (analyticsError)
    return <div className="p-6 text-red-600">Error: {analyticsError}</div>;

  return (
    <div className="w-full bg-white p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 relative">
        <h1 className="text-black text-4xl font-bold font-serif">Analytics</h1>

        {/* FILTER BUTTON */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown((s) => !s)}
            className="flex items-center gap-2 bg-lime-400 rounded-md px-4 py-2"
          >
            <span className="text-black text-base">
              {range === "today"
                ? "Today"
                : range === "30d"
                ? "Last 30 Days"
                : "Last 7 Days"}
            </span>
            <span className="text-black text-xl">▾</span>
          </button>

          {/* DROPDOWN */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <div
                className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setRange("today");
                  setShowDropdown(false);
                }}
              >
                Today
              </div>
              <div
                className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setRange("7d");
                  setShowDropdown(false);
                }}
              >
                Last 7 Days
              </div>
              <div
                className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setRange("30d");
                  setShowDropdown(false);
                }}
              >
                Last 30 Days
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="text-zinc-500 text-xl mb-6">
        Overview of recruitment activity and database growth
      </p>

      {/* METRICS */}
      <div className="flex flex-wrap gap-3">
        <MetricCard
          title="Total Resumes"
          value={totalCandidates}
          icon={FaFileAlt}
        />
        <MetricCard
          title="Added Today"
          value={todayCount}
          icon={FaPlusCircle}
        />
        <MetricCard title="Last 7 Days" value={last7Count} icon={FaChartBar} />
        <MetricCard
          title="Top Location"
          value={topLocations?.[0]?.count ?? "—"}
          subtitle={topLocations?.[0]?._id ?? "—"}
          icon={FaChartBar}
        />
        <MetricCard
          title="Top Skill"
          value={topSkills?.[0]?.count ?? "—"}
          subtitle={topSkills?.[0]?._id ?? "—"}
          icon={FaChartBar}
        />
        <MetricCard
          title="Top Source"
          value={portalStats?.[0]?.count ?? "—"}
          subtitle={portalStats?.[0]?._id ?? "—"}
          icon={FaChartBar}
        />
      </div>

      {/* TABLE SECTIONS */}
      <TableSection
        title="Location Analytics"
        columns={["Location", "Total CVs", "Period CVs"]}
        rows={locationRows}
      />

      <TableSection
        title="Skills Analytics"
        columns={["Skill", "Total CVs"]}
        rows={skillRows}
      />

      <TableSection
        title="Resume Source Analytics"
        columns={["Source", "Total CVs"]}
        rows={sourceRows}
      />

      <TableSection
        title="Top Job Titles"
        columns={["Job Title", "Total CVs"]}
        rows={jobRows}
      />

      <TableSection
        title="Experience Distribution"
        columns={["Experience Range", "Total Candidates"]}
        rows={expRows}
      />
    </div>
  );
}
