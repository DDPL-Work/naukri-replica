import React from "react";
import { LuDownload, LuSearch, LuActivity, LuArrowRight } from "react-icons/lu";

const RecruiterDashboard = () => {
  const progress = 3;
  const total = 10;
  const percentage = (progress / total) * 100;

  const recentSearches = [
    {
      role: "React Developer",
      count: 45,
      time: "2 hours ago",
    },
    {
      role: "Product Manager",
      count: 32,
      time: "5 hours ago",
    },
    {
      role: "UI/UX Designer",
      count: 28,
      time: "1 day ago",
    },
  ];
  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">
          Welcome back, Recruiter!
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Your dashboard is ready with the latest insights and tools to find top
          talent.
        </p>
      </div>

      {/* Progress Card */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
        <div className="flex items-center gap-2 text-gray-700 font-medium">
          <LuDownload size={18} /> Downloads Resume Today
        </div>

        <div className="mt-4">
          <div className="text-3xl font-semibold text-[#103c7f] flex items-end gap-1">
            {progress}
            <span className="text-gray-400 text-lg">/ {total}</span>
          </div>

          <div className="w-full h-2 bg-gray-200 rounded-full mt-3">
            <div
              className="h-2 bg-[#103c7f] rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ">
        {/* Quick Search */}
        <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm ">
          <div className="flex items-center gap-2 text-gray-800 font-medium">
            <LuSearch size={18} /> Quick Candidate Search
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Find candidates by skill, location, and experience.
          </p>
          <button className="mt-2 text-center border border-[#103c7f] px-4 py-2 rounded-md text-sm hover:bg-gray-50 flex items-center gap-2">
            Start New Search <LuArrowRight size={14} />
          </button>
        </div>

        {/* Activity Logs */}
        <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
          <div className="flex items-center gap-2 text-gray-800 font-medium">
            <LuActivity size={18} /> Activity Logs
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Track your search history and profile interactions.
          </p>
          <button className="mt-2  border border-[#103c7f] px-4 py-2 rounded-md text-sm hover:bg-gray-50 flex items-center gap-2">
            Track Activity <LuArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Recent Searches */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Searches
          </h2>
          <button className="text-sm text-blue-600 flex items-center gap-1 hover:underline">
            View All <LuArrowRight size={14} />
          </button>
        </div>

        <div className="space-y-3">
          {recentSearches.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-blue-50 hover:bg-blue-100 transition"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-100 text-indigo-600 flex items-center justify-center rounded-md">
                  <LuSearch size={20} />
                </div>
                <div>
                  <div className="text-gray-900 font-medium">{item.role}</div>
                  <div className="text-gray-500 text-sm">
                    {item.count} candidates found · {item.time}
                  </div>
                </div>
              </div>

              <button className="border px-4 py-2 rounded-md text-sm hover:bg-gray-50">
                View Results
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
