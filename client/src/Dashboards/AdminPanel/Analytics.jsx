import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAnalytics } from "../../features/slices/adminSlice";

import { FaFileAlt, FaPlusCircle, FaChartBar } from "react-icons/fa";

const Analytics = () => {
  const dispatch = useDispatch();

  const { analyticsLoading, analyticsError, analyticsData } = useSelector(
    (state) => state.admin
  );

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, []);

  const total = analyticsData?.totalCandidates ?? "—";
  const today = analyticsData?.todayCount ?? "—";
  const last7 = analyticsData?.last7Count ?? "—";

  const topLocations = analyticsData?.topLocations || [];
  const topSkills = analyticsData?.topSkills || [];

  // NEW DATA FIELDS
  const portalStats = analyticsData?.portalStats || [];
  const topDesignations = analyticsData?.topDesignations || [];
  const experienceBuckets = analyticsData?.experienceBuckets || [];

  if (analyticsLoading)
    return (
      <div className="w-full bg-white p-6">
        <p className="text-xl text-zinc-600 font-[Calibri]">
          Loading analytics...
        </p>
      </div>
    );

  if (analyticsError)
    return (
      <div className="w-full bg-white p-6">
        <p className="text-xl text-red-600 font-[Calibri]">
          Error: {analyticsError}
        </p>
      </div>
    );

  return (
    <div className="w-full bg-white p-6">
      {/* PAGE TITLE */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-black text-4xl font-bold font-serif leading-[60px]">
          Analytics
        </h1>

        <button className="flex items-center gap-2 bg-lime-400 rounded-md px-4 py-2">
          <span className="text-black text-base font-normal font-['Calibri']">
            Last 7 Days
          </span>
          <span className="text-black text-xl">▾</span>
        </button>
      </div>

      <p className="text-zinc-500 text-xl font-normal font-['Calibri'] leading-6 mb-6">
        Overview of recruitment activity and database growth
      </p>

      {/* METRIC CARDS */}
      <div className="flex flex-wrap gap-3">
        {/* Total Resumes */}
        <div className="w-80 p-6 bg-blue-900/5 border border-blue-900/30 rounded-lg">
          <div className="flex justify-between">
            <div>
              <p className="text-black text-sm uppercase font-['Calibri'] leading-5 tracking-tight">
                Total Resumes
              </p>
              <p className="text-blue-900 text-3xl font-bold font-['Calibri'] leading-9">
                {total.toLocaleString?.() || total}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
              <FaFileAlt className="text-white text-2xl" />
            </div>
          </div>
        </div>

        {/* Added Today */}
        <div className="w-80 p-6 bg-blue-900/5 border border-blue-900/30 rounded-lg">
          <div className="flex justify-between">
            <div>
              <p className="text-black text-sm uppercase font-['Calibri'] tracking-tight leading-5">
                Added Today
              </p>
              <p className="text-blue-900 text-3xl font-bold font-['Calibri'] leading-9">
                {today}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
              <FaPlusCircle className="text-white text-2xl" />
            </div>
          </div>

          <div className="flex items-center gap-1 pt-2">
            <span className="text-zinc-500 text-sm font-['Calibri'] leading-5">
              ↑
            </span>
            <span className="text-zinc-500 text-sm font-['Calibri'] leading-5">
              —
            </span>
            <span className="text-zinc-500 text-sm font-['Calibri'] leading-5">
              vs last period
            </span>
          </div>
        </div>

        {/* Last 7 Days */}
        <div className="w-80 p-6 bg-blue-900/5 border border-blue-900/30 rounded-lg">
          <div className="flex justify-between">
            <div>
              <p className="text-black text-sm uppercase font-['Calibri'] tracking-tight">
                Last 7 Days
              </p>
              <p className="text-blue-900 text-3xl font-bold font-['Calibri']">
                {last7}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
              <FaChartBar className="text-white text-2xl" />
            </div>
          </div>

          <div className="flex items-center gap-1 pt-2">
            <span className="text-zinc-500 text-sm font-['Calibri'] leading-5">
              ↑
            </span>
            <span className="text-zinc-500 text-sm font-['Calibri'] leading-5">
              —
            </span>
            <span className="text-zinc-500 text-sm font-['Calibri'] leading-5">
              vs last period
            </span>
          </div>
        </div>
        {/* Top Location */}
        <div className="w-80 p-6 bg-blue-900/5 border border-blue-900/30 rounded-lg">
          <div className="flex justify-between">
            <div>
              <p className="text-black text-sm uppercase font-['Calibri'] leading-5 tracking-tight">
                Top Location
              </p>
              <p className="text-blue-900 text-3xl font-bold font-['Calibri'] leading-9">
                {topLocations?.[0]?.count ?? "—"}
              </p>
              <p className="text-black text-sm font-['Calibri'] mt-1">
                {topLocations?.[0]?._id ?? "—"}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
              <FaChartBar className="text-white text-2xl" />
            </div>
          </div>
        </div>

        {/* Top Skill */}
        <div className="w-80 p-6 bg-blue-900/5 border border-blue-900/30 rounded-lg">
          <div className="flex justify-between">
            <div>
              <p className="text-black text-sm uppercase font-['Calibri'] leading-5 tracking-tight">
                Top Skill
              </p>
              <p className="text-blue-900 text-3xl font-bold font-['Calibri'] leading-9">
                {topSkills?.[0]?.count ?? "—"}
              </p>
              <p className="text-black text-sm font-['Calibri'] mt-1">
                {topSkills?.[0]?._id ?? "—"}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
              <FaChartBar className="text-white text-2xl" />
            </div>
          </div>
        </div>

        {/* Top Resume Source */}
        <div className="w-80 p-6 bg-blue-900/5 border border-blue-900/30 rounded-lg">
          <div className="flex justify-between">
            <div>
              <p className="text-black text-sm uppercase font-['Calibri'] leading-5 tracking-tight">
                Top Source
              </p>
              <p className="text-blue-900 text-3xl font-bold font-['Calibri'] leading-9">
                {portalStats?.[0]?.count ?? "—"}
              </p>
              <p className="text-black text-sm font-['Calibri'] mt-1">
                {portalStats?.[0]?._id ?? "—"}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
              <FaChartBar className="text-white text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* ============= LOCATION ANALYTICS ============= */}
      <div className="w-full mt-10 bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-zinc-200">
          <h2 className="text-black text-lg font-bold font-['Calibri']">
            Location Analytics
          </h2>
        </div>

        <div className="bg-blue-900 px-12 py-3 text-white font-bold uppercase text-sm font-['Calibri'] tracking-wide grid grid-cols-3">
          <span>Location</span>
          <span>Total CVs</span>
          <span>CVs Added (Period)</span>
        </div>

        {topLocations.map((loc, i) => (
          <div
            key={i}
            className="px-12 py-3 grid grid-cols-3 border-b border-zinc-200"
          >
            <span className="text-black text-sm font-['Calibri']">
              {loc._id || "Unknown"}
            </span>
            <span className="text-black text-sm font-['Calibri']">
              {loc.count}
            </span>
            <span className="text-sky-900 text-sm font-bold font-['Calibri']">
              —
            </span>
          </div>
        ))}
      </div>

      {/* ============= SKILLS ANALYTICS ============= */}
      <div className="w-full mt-10 bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-zinc-200">
          <h2 className="text-black text-lg font-bold font-['Calibri']">
            Skills Analytics
          </h2>
        </div>

        <div className="bg-blue-900 px-12 py-3 text-white font-bold uppercase text-sm font-['Calibri'] tracking-wide grid grid-cols-2">
          <span>Skill</span>
          <span>Total CVs</span>
        </div>

        {topSkills.map((skill, i) => (
          <div
            key={i}
            className="px-12 py-3 grid grid-cols-2 border-b border-zinc-200"
          >
            <span className="text-black text-sm font-['Calibri']">
              {skill._id || "Unknown"}
            </span>
            <span className="text-sky-900 text-sm font-bold font-['Calibri']">
              {skill.count}
            </span>
          </div>
        ))}
      </div>

      {/* ============= RESUME SOURCE ANALYTICS ============= */}
      <div className="w-full mt-10 bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-zinc-200">
          <h2 className="text-black text-lg font-bold font-['Calibri']">
            Resume Source Analytics
          </h2>
        </div>

        <div className="bg-blue-900 px-12 py-3 text-white font-bold uppercase text-sm font-['Calibri'] tracking-wide grid grid-cols-2">
          <span>Source</span>
          <span>Total CVs</span>
        </div>

        {portalStats.map((src, i) => (
          <div
            key={i}
            className="px-12 py-3 grid grid-cols-2 border-b border-zinc-200"
          >
            <span className="text-black text-sm font-['Calibri']">
              {src._id || "Unknown"}
            </span>
            <span className="text-sky-900 text-sm font-bold font-['Calibri']">
              {src.count}
            </span>
          </div>
        ))}
      </div>

      {/* ============= TOP JOB TITLES ============= */}
      <div className="w-full mt-10 bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-zinc-200">
          <h2 className="text-black text-lg font-bold font-['Calibri']">
            Top Job Titles
          </h2>
        </div>

        <div className="bg-blue-900 px-12 py-3 text-white font-bold uppercase text-sm font-['Calibri'] tracking-wide grid grid-cols-2">
          <span>Job Title</span>
          <span>Total CVs</span>
        </div>

        {topDesignations.map((job, i) => (
          <div
            key={i}
            className="px-12 py-3 grid grid-cols-2 border-b border-zinc-200"
          >
            <span className="text-black text-sm font-['Calibri']">
              {job._id || "Unknown"}
            </span>
            <span className="text-sky-900 text-sm font-bold font-['Calibri']">
              {job.count}
            </span>
          </div>
        ))}
      </div>

      {/* ============= EXPERIENCE BUCKETS ============= */}
      <div className="w-full mt-10 bg-white border border-zinc-200 rounded-lg overflow-hidden mb-10">
        <div className="p-4 border-b border-zinc-200">
          <h2 className="text-black text-lg font-bold font-['Calibri']">
            Experience Distribution
          </h2>
        </div>

        <div className="bg-blue-900 px-12 py-3 text-white font-bold uppercase text-sm font-['Calibri'] tracking-wide grid grid-cols-2">
          <span>Experience Range</span>
          <span>Total Candidates</span>
        </div>

        {experienceBuckets.map((bucket, i) => {
          const label =
            bucket._id === 0
              ? "0 - 2 Years"
              : bucket._id === 2
              ? "2 - 5 Years"
              : bucket._id === 5
              ? "5 - 10 Years"
              : bucket._id === 10
              ? "10 - 20 Years"
              : bucket._id === 20
              ? "20+ Years"
              : "Unknown";

          return (
            <div
              key={i}
              className="px-12 py-3 grid grid-cols-2 border-b border-zinc-200"
            >
              <span className="text-black text-sm font-['Calibri']">
                {label}
              </span>
              <span className="text-sky-900 text-sm font-bold font-['Calibri']">
                {bucket.count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Analytics;
