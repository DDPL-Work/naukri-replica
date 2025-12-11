import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAnalytics } from "../../features/slices/adminSlice";

import {
  FaFileAlt,
  FaPlusCircle,
  FaChartBar,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

const GRID_CLASS = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

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

const TableSection = ({ title, columns, rows }) => {
  const [visibleCount, setVisibleCount] = useState(10);

  const visibleRows = rows.slice(0, visibleCount);
  const moreAvailable = rows.length > visibleCount;

  // Should we switch to two-column layout?
  const useTwoColumns = rows.length > 10;

  // ---------- Two-column split logic ----------
  let leftColumn = [];
  let rightColumn = [];

  if (useTwoColumns) {
    const mid = Math.ceil(visibleRows.length / 2);
    leftColumn = visibleRows.slice(0, mid);
    rightColumn = visibleRows.slice(mid);
  }

  // ---------- SINGLE COLUMN MODE ----------
  if (!useTwoColumns) {
    return (
      <div className="w-full mt-10 bg-white border border-zinc-200 rounded-lg overflow-hidden pb-4">
        <div className="p-4 border-b border-zinc-200">
          <h2 className="text-black text-lg font-bold">{title}</h2>
        </div>

        {/* Header */}
        <div
          className={`bg-blue-900 px-12 py-3 text-white font-bold uppercase text-sm grid ${
            GRID_CLASS[columns.length]
          }`}
        >
          {columns.map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </div>

        {/* Rows */}
        {visibleRows.map((row, idx) => (
          <div
            key={idx}
            className={`px-12 py-3 border-b border-zinc-200 grid ${
              GRID_CLASS[columns.length]
            }`}
          >
            {row.map((val, i) => {
              const value = val || "Unknown";
              return (
                <span
                  key={i}
                  className={`text-sm ${
                    i === 1 ? "text-blue-900 font-bold" : "text-black"
                  }`}
                >
                  {value}
                </span>
              );
            })}
          </div>
        ))}

        {/* View More */}
        {moreAvailable && (
          <div className="flex justify-center mt-3">
            <button
              className="px-6 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800"
              onClick={() => setVisibleCount(visibleCount + 5)}
            >
              View More
            </button>
          </div>
        )}
      </div>
    );
  }

  // ---------- TWO COLUMN MODE ----------
  return (
    <div className="w-full mt-10 bg-white border border-zinc-200 rounded-lg overflow-hidden pb-4">
      <div className="p-4 border-b border-zinc-200">
        <h2 className="text-black text-lg font-bold">{title}</h2>
      </div>

      {/* 4-column header (two sets of columns) */}
      <div className="bg-blue-900 px-12 py-3 text-white font-bold uppercase text-sm grid grid-cols-4">
        {columns.map((c, i) => (
          <span key={`h1-${i}`}>{c}</span>
        ))}
        {columns.map((c, i) => (
          <span key={`h2-${i}`}>{c}</span>
        ))}
      </div>

      {/* Render paired rows */}
      {leftColumn.map((left, idx) => {
        const right = rightColumn[idx]; // may be undefined if uneven count

        return (
          <div
            key={idx}
            className="px-12 py-3 border-b border-zinc-200 grid grid-cols-4"
          >
            {/* LEFT SIDE */}
            <span className="text-black text-sm">{left?.[0] || ""}</span>
            <span className="text-blue-900 font-bold text-sm">
              {left?.[1] || ""}
            </span>

            {/* RIGHT SIDE */}
            <span className="text-black text-sm">{right?.[0] || ""}</span>
            <span className="text-blue-900 font-bold text-sm">
              {right?.[1] || ""}
            </span>
          </div>
        );
      })}

      {/* View More / View Less */}
      {moreAvailable || visibleCount > 10 ? (
        <div className="flex justify-center mt-3 gap-4">
          {/* VIEW MORE */}
          {moreAvailable && (
            <button
              className=" flex items-center gap-1 font-medium text-green-500 rounded-md hover:underline"
              onClick={() => setVisibleCount((prev) => prev + 5)}
            >
              View More <FaChevronDown />
            </button>
          )}

          {/* VIEW LESS (only show if visibleCount > 10) */}
          {visibleCount > 10 && (
            <button
              className=" flex items-center gap-1 font-medium text-red-500 rounded-md hover:underline"
              onClick={() => setVisibleCount((prev) => Math.max(10, prev - 5))}
            >
              View Less <FaChevronUp />
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default function Analytics() {
  const dispatch = useDispatch();

  const { analyticsLoading, analyticsError, analyticsData } = useSelector(
    (state) => state.admin
  );

  const [range, setRange] = useState("7d");

  useEffect(() => {
    dispatch(fetchAnalytics({ range }));
  }, [range]);

  const {
    totalCandidates = "—",
    todayCount = "—",
    last7Count = "—",

    locationCounts = [],
    skillCounts = [],
    designationCounts = [],
    companyCounts = [],
    portalCounts = [],
    experienceCounts = [],
  } = analyticsData || {};

  const safe = (v) =>
    v === undefined || v === null || v === "" ? "Unknown" : v;

  // Convert data into table rows
  const locationRows = locationCounts.map((l) => [l._id, l.count]);
  const skillRows = skillCounts.map((s) => [s._id, s.count]);
  const designationRows = designationCounts.map((d) => [d._id, d.count]);
  const companyRows = companyCounts.map((c) => [c._id, c.count]);
  const portalRows = portalCounts.map((p) => [p._id, p.count]);
  const experienceRows = experienceCounts.map((e) => [
    `${e._id} Years`,
    e.count,
  ]);

  if (analyticsLoading) return <div className="p-6">Loading analytics...</div>;
  if (analyticsError)
    return <div className="p-6 text-red-600">Error: {analyticsError}</div>;

  return (
    <div className="w-full bg-white p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 relative">
        <h1 className="text-black text-4xl font-bold font-serif">Analytics</h1>
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
      </div>

      {/* TABLE SECTIONS */}
      <TableSection
        title="Location Analytics"
        columns={["Location", "Total CVs"]}
        rows={locationRows}
      />
      <TableSection
        title="Skills Analytics"
        columns={["Skill", "Total CVs"]}
        rows={skillRows}
      />
      <TableSection
        title="Designation Analytics"
        columns={["Designation", "Total CVs"]}
        rows={designationRows}
      />
      <TableSection
        title="Company Analytics"
        columns={["Company", "Total CVs"]}
        rows={companyRows}
      />
      <TableSection
        title="Resume Source Analytics"
        columns={["Source", "Total CVs"]}
        rows={portalRows}
      />
      <TableSection
        title="Experience Distribution"
        columns={["Experience", "Total Candidates"]}
        rows={experienceRows}
      />
    </div>
  );
}
