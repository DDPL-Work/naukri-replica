import React, { useEffect, useMemo, useState } from "react";
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

// Normalize string for comparison
const normalizeKey = (v) => (v || "Unknown").toString().trim().toLowerCase();

// Convert to display format
const toTitleCase = (v) =>
  v.replace(/\w\S*/g, (t) => t[0].toUpperCase() + t.slice(1).toLowerCase());

// Merge analytics counts ignoring case
const mergeCaseInsensitiveCounts = (data = []) => {
  const map = new Map();

  data.forEach(({ _id, count }) => {
    const key = normalizeKey(_id);

    if (!map.has(key)) {
      map.set(key, {
        label: toTitleCase(_id || "Unknown"),
        count: count || 0,
      });
    } else {
      map.get(key).count += count || 0;
    }
  });

  return Array.from(map.values()).sort((a, b) => b.count - a.count);
};

const normalizeLocationKey = (value) => {
  if (!value) return "unknown";

  // Split by comma → trim → remove empty
  const parts = value
    .toString()
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  // RULE: use the FIRST city as canonical
  // "Panipat, Panipat" → Panipat
  // "Samalkha, Panipat" → Samalkha
  // "Sonipat, Haryana" → Sonipat
  const primary = parts[0];

  return primary.toLowerCase();
};

const formatLocationLabel = (value) =>
  value.replace(/\w\S*/g, (t) => t[0].toUpperCase() + t.slice(1).toLowerCase());

const mergeLocationCounts = (data = []) => {
  const map = new Map();

  data.forEach(({ _id, count }) => {
    const key = normalizeLocationKey(_id);

    if (!map.has(key)) {
      map.set(key, {
        label: formatLocationLabel(key),
        count: count || 0,
      });
    } else {
      map.get(key).count += count || 0;
    }
  });

  return Array.from(map.values()).sort((a, b) => b.count - a.count);
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

const TableSection = ({ title, columns, rows, noMarginTop = false }) => {
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
      <div
        className={`w-full bg-white border border-zinc-200 rounded-lg overflow-hidden pb-4 ${
          noMarginTop ? "" : "mt-10"
        }`}
      >
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
    <div
      className={`w-full bg-white border border-zinc-200  overflow-hidden pb-4 ${
        noMarginTop ? "" : "mt-10 rounded-lg"
      }`}
    >
      <div className={`p-4 border-b border-zinc-200 ${noMarginTop ? "hidden":"block"}`}>
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
  const [selectedLocation, setSelectedLocation] = useState("ALL");
  const [locationQuery, setLocationQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

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

  const locationOptions = [
    "ALL",
    ...mergeLocationCounts(locationCounts).map((l) => l.label),
  ];

  const filteredLocationOptions = locationOptions.filter((loc) =>
    loc.toLowerCase().includes(locationQuery.toLowerCase())
  );

  // Convert data into table rows
  const locationRows = mergeLocationCounts(locationCounts).map((l) => [
    l.label,
    l.count,
  ]);

  const skillRows = mergeCaseInsensitiveCounts(skillCounts).map((s) => [
    s.label,
    s.count,
  ]);

  const designationRows = designationCounts.map((d) => [d._id, d.count]);
  const companyRows = companyCounts.map((c) => [c._id, c.count]);
  const portalRows = portalCounts.map((p) => [p._id, p.count]);
  const experienceRows = experienceCounts.map((e) => [
    `${e._id} Years`,
    e.count,
  ]);

  const filteredDesignationRows = useMemo(() => {
    if (!analyticsData?.designationByLocation) return [];

    const normalizedLocation = locationQuery
      ? locationQuery.toLowerCase()
      : "ALL";

    const rows =
      normalizedLocation === "ALL"
        ? analyticsData.designationByLocation
        : analyticsData.designationByLocation.filter(
            (d) => d.location === normalizedLocation
          );

    const map = new Map();

    rows.forEach(({ designation, count }) => {
      map.set(designation, (map.get(designation) || 0) + count);
    });

    return Array.from(map.entries()).map(([designation, count]) => [
      designation,
      count,
    ]);
  }, [analyticsData, locationQuery]);

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

      {/* Designation Analytics */}
      <div className="w-full mt-10 bg-white border border-zinc-200 rounded-lg overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200">
          <h2 className="text-black text-lg font-bold">
            Designation Analytics
          </h2>

          {/* LOCATION COMBO INPUT */}
          <div className="relative w-64">
            <input
              type="text"
              value={locationQuery}
              placeholder="Filter by location"
              onFocus={() => setShowDropdown(true)}
              onChange={(e) => {
                setLocationQuery(e.target.value);
                setSelectedLocation(e.target.value || "ALL");
                setShowDropdown(true);
              }}
              onBlur={() => {
                setTimeout(() => setShowDropdown(false), 150);
              }}
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900"
            />

            {showDropdown && filteredLocationOptions.length > 0 && (
              <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-zinc-300 rounded-md shadow-lg">
                {filteredLocationOptions.map((loc) => (
                  <div
                    key={loc}
                    onMouseDown={() => {
                      setSelectedLocation(loc);
                      setLocationQuery(loc === "ALL" ? "" : loc);
                      setShowDropdown(false);
                    }}
                    className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-900 hover:text-white"
                  >
                    {loc}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* TABLE */}
        <TableSection
          title=""
          columns={["Designation", "Total CVs"]}
          rows={filteredDesignationRows}
          noMarginTop
        />
      </div>

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
