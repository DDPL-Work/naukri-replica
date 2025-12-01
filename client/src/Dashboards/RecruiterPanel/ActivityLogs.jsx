import React from "react";
import { FiLogIn, FiSearch, FiEye, FiDownload } from "react-icons/fi";

const logs = [
  {
    type: "login",
    action: "User login",
    details: "Successful login",
    timestamp: "2025-01-20 09:15:23",
  },
  {
    type: "search",
    action: "Keyword search",
    details: "Senior Developer React",
    timestamp: "2025-01-20 09:20:45",
  },
  {
    type: "view",
    action: "Profile viewed",
    details: "John Doe - Senior Developer",
    timestamp: "2025-01-20 09:25:12",
  },
  {
    type: "download",
    action: "Resume downloaded",
    details: "John Doe resume.pdf",
    timestamp: "2025-01-20 09:30:00",
  },
  {
    type: "search",
    action: "Keyword search",
    details: "UI Designer Bangalore",
    timestamp: "2025-01-20 10:15:30",
  },
  {
    type: "view",
    action: "Profile viewed",
    details: "Jane Smith - UI Designer",
    timestamp: "2025-01-20 10:20:18",
  },
  {
    type: "download",
    action: "Resume downloaded",
    details: "Jane Smith resume.pdf",
    timestamp: "2025-01-20 10:25:45",
  },
];

const getIcon = (type) => {
  switch (type) {
    case "login":
      return <FiLogIn className="text-lg" />;
    case "search":
      return <FiSearch className="text-lg" />;
    case "view":
      return <FiEye className="text-lg" />;
    case "download":
      return <FiDownload className="text-lg" />;
    default:
      return null;
  }
};

const getTagColor = (type) => {
  switch (type) {
    case "login":
      return "bg-gray-200 text-gray-800";
    case "search":
      return "border border-gray-300 text-gray-800";
    case "view":
      return "border border-gray-300 text-gray-800";
    case "download":
      return "bg-[#103c7f] text-white";
    default:
      return "bg-gray-200 text-gray-800";
  }
};

const ActivityLogsPage = () => {
  return (
    <div className="w-full px-8 py-10">
      <h1 className="text-4xl font-bold mb-2">Activity logs</h1>
      <p className="text-gray-500 mb-8">
        Track your search history and profile interactions
      </p>

      {/* FILTERS */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 mb-10">
        <h3 className="text-lg font-semibold mb-4">Filter Logs</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Activity Type */}
          <div>
            <label className="block text-gray-600 mb-1">Activity Type</label>
            <select className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-gray-600">
              <option>All activities</option>
              <option>Login</option>
              <option>Search</option>
              <option>View</option>
              <option>Download</option>
            </select>
          </div>

          {/* From Date */}
          <div>
            <label className="block text-gray-600 mb-1">From Date</label>
            <input
              type="date"
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-gray-600"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-gray-600 mb-1">To Date</label>
            <input
              type="date"
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-gray-600"
            />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        <div className="grid grid-cols-4 font-semibold text-gray-700 pb-3 border-b border-gray-200">
          <div>Type</div>
          <div>Action</div>
          <div>Details</div>
          <div>Timestamp</div>
        </div>

        {logs.map((log, index) => (
          <div
            key={index}
            className="grid grid-cols-4 items-center py-4 border-b border-gray-200 last:border-b-0"
          >
            {/* TYPE + ICON */}
            <div className="flex items-center gap-2">
              <div className="p-2 text-[#103c7f] rounded-lg">
                {getIcon(log.type)}
              </div>

              <span
                className={`px-3 py-1 text-xs rounded-full font-semibold capitalize ${getTagColor(
                  log.type
                )}`}
              >
                {log.type}
              </span>
            </div>

            {/* ACTION */}
            <div className="text-[#103c7f] hover:underline cursor-pointer">
              {log.action}
            </div>

            {/* DETAILS */}
            <div className="text-gray-700">{log.details}</div>

            {/* TIMESTAMP */}
            <div className="text-gray-500">{log.timestamp}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityLogsPage;
