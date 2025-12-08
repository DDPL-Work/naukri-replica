import React, { useEffect, useMemo } from "react";
import { LuDownload, LuSearch, LuActivity, LuArrowRight } from "react-icons/lu";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchRecruiterLogs } from "../../features/slices/recruiterLogSlice";

export default function RecruiterDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    logs = [],
    loading,
    error,
  } = useSelector((state) => state.recruiterLogs);

  const authUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(fetchRecruiterLogs());
  }, [dispatch]);

  const todayISO = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // -------------------------------------------------------------------
  // TODAY DOWNLOAD COUNT (SERVER LOGS)
  // -------------------------------------------------------------------
  const todayDownloads = useMemo(() => {
    return logs.filter(
      (log) =>
        log.action === "resume_download" && log.createdAt.startsWith(todayISO)
    ).length;
  }, [logs, todayISO]);

  // REAL daily limit from backend user record
  const DAILY_LIMIT = authUser?.dailyDownloadLimit || 10;

  const progressPercentage = Math.min(
    (todayDownloads / DAILY_LIMIT) * 100,
    100
  );

  // -------------------------------------------------------------------
  // RECENT SEARCHES (show last 5)
  // -------------------------------------------------------------------
  const recentSearches = useMemo(() => {
    return logs.filter((log) => log.action === "search_candidates").slice(0, 5);
  }, [logs]);

  return (
    <div className="w-full space-y-10 bg-white">
      {/* TITLE */}
      <div>
        <h1 className="text-black text-4xl font-bold font-serif leading-[60px]">
          Welcome back, Recruiter!
        </h1>

        <p className="text-zinc-500/95 text-xl font-normal font-[Calibri] leading-8 max-w-2xl">
          Your dashboard is ready with the latest insights and tools to find top
          talent.
        </p>
      </div>

      {/* RESUME DOWNLOAD CARD */}
      <div className="w-[1040px] bg-white rounded-lg shadow-sm  outline-1 outline-zinc-200 p-6">
        <div className="flex items-center gap-2">
          <LuDownload size={20} className="text-black" />
          <span className="text-black text-lg font-bold font-[Calibri] leading-7">
            Downloads Resume Today
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-end gap-2">
            <span className="text-blue-900 text-4xl font-bold font-[Lato] leading-10">
              {todayDownloads}
            </span>
            <span className="text-zinc-500 text-2xl font-normal font-[Lato] leading-8">
              / {DAILY_LIMIT}
            </span>
          </div>

          <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
            <div
              style={{ width: `${progressPercentage}%` }}
              className="h-2 bg-blue-900 rounded-full transition-all"
            ></div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="flex gap-6">
        {/* QUICK SEARCH */}
        <div className="w-60 bg-white rounded-xl shadow-sm  outline-1 outline-zinc-200/50 p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <LuSearch size={18} className="text-black" />
            <span className="text-black text-base font-normal font-[Calibri] leading-5">
              Quick Candidate Search
            </span>
          </div>

          <p className="text-zinc-500 text-xs font-normal font-[Calibri] leading-4">
            Find candidates by skill, location, and experience.
          </p>

          <Link
            to="/recruiter/candidate-search"
            className="w-full text-center text-black text-xs font-normal font-[Calibri] leading-5 rounded-md  outline-1 outline-blue-900 h-7 flex items-center justify-center gap-1 hover:bg-[#a1db40] hover:outline-0 "
          >
            Start New Search <LuArrowRight size={12} />
          </Link>
        </div>

        {/* ACTIVITY LOGS */}
        <div className="w-60 bg-white rounded-xl shadow-sm  outline-1 outline-zinc-200/50 p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <LuActivity size={18} className="text-black" />
            <span className="text-black text-base font-normal font-[Calibri] leading-5">
              Activity Logs
            </span>
          </div>

          <p className="text-zinc-500 text-xs font-normal font-[Calibri] leading-4">
            Track your search history and profile interactions
          </p>

          <Link
            to="/recruiter/activity-logs"
            className="w-full text-center text-black text-xs font-normal font-[Calibri] leading-5 rounded-md  outline-1 outline-blue-900 h-7 flex items-center justify-center gap-1 hover:bg-[#a1db40] hover:outline-0"
          >
            Track Activity <LuArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* RECENT SEARCHES */}
      <div className="w-[1035px] bg-white rounded-xl shadow-sm  outline-1 outline-zinc-200/50 p-8 flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h2 className="text-black text-2xl font-bold font-[Calibri] leading-8">
            Recent Searches
          </h2>

          <Link
            to="/recruiter/activity-logs"
            className="text-color-azure-25 text-sm font-normal font-[Calibri] leading-5 flex items-center gap-1 hover:text-blue-600"
          >
            View All <LuArrowRight size={14} />
          </Link>
        </div>

        {loading && <p>Loading logs...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="flex flex-col gap-4">
          {recentSearches.length === 0 && !loading ? (
            <p className="text-zinc-500">No recent searches found</p>
          ) : (
            recentSearches.map((item, index) => (
              <div
                key={index}
                className="w-full p-5 bg-linear-to-r from-zinc-100 to-zinc-200 rounded-2xl  outline-1 outline-zinc-200/50 flex justify-between items-center"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-linear-to-br from-blue-900/10 to-blue-900/5 rounded-xl  outline-1 outline-blue-900/10 flex justify-center items-center">
                    <LuSearch size={24} className="text-blue-900" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="text-black text-lg font-normal font-[Calibri] leading-7">
                      {item.details.query?.q || "General Search"}
                    </div>

                    <div className="flex gap-2 text-sm font-normal font-[Calibri]">
                      <span className="text-blue-900">
                        {item.details.count || ""}
                      </span>
                      <span className="text-zinc-500">candidates found</span>
                      <span className="text-zinc-500">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    navigate("/recruiter/candidate-search", {
                      state: { prefill: item.details?.query },
                    })
                  }
                  className="px-3 py-2 bg-stone-50 rounded-[10px]  outline-1 outline-blue-900/20 text-blue-900 text-sm font-normal font-[Calibri] leading-5"
                >
                  View Results
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
