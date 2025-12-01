import React from "react";
import {
  FiUser,
  FiPlusSquare,
  FiCalendar,
  FiSearch,
  FiDownload,
  FiChevronRight,
  FiLogIn,
  FiEye,
} from "react-icons/fi";

const bgCondition = "thead";

export default function AdminDashboard() {
  return (
    <div className="p-8 w-full">
      {/* HEADER */}
      <h1 className="text-4xl font-bold">Welcome back, Admin!</h1>
      <p className="text-gray-500 mt-1 mb-8">
        Welcome back! Here’s an overview of your candidate portal.
      </p>

      <div className="h-auto">
        {/* TOP CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Total Candidates */}
          <DashboardCard
            icon={<FiUser />}
            title="Total Candidates"
            value="125,847"
          />

          {/* New Today */}
          <DashboardCard
            icon={<FiPlusSquare />}
            title="New Today"
            value="342"
            sub="12% vs last period"
          />

          {/* New This Week */}
          <DashboardCard
            icon={<FiCalendar />}
            title="New This Week"
            value="2,156"
            sub="8% vs last period"
          />
        </div>

        {/* SECOND ROW SMALL CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <DashboardCard
            icon={<FiSearch />}
            title="Searches Today"
            value="1,847"
          />
          <DashboardCard
            icon={<FiDownload />}
            title="Downloads Today"
            value="523"
          />
        </div>
      </div>

      {/* TOP 5 LOCATIONS + TOP 5 SKILLS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* LOCATIONS */}
        <ListCard
          title="Top 5 Locations"
          data={[
            ["Bangalore", "1,450 CVs"],
            ["Mumbai", "987 CVs"],
            ["Hyderabad", "856 CVs"],
            ["Chennai", "654 CVs"],
            ["Pune", "768 CVs"],
          ]}
        />

        {/* SKILLS */}
        <ListCard
          title="Top 5 Skills"
          data={[
            ["React", "876 candidates"],
            ["Node.js", "754 candidates"],
            ["Python", "698 candidates"],
            ["Java", "645 candidates"],
            ["AWS", "589 candidates"],
          ]}
        />
      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4">
          <h2 className="text-xl font-semibold text-[#103c7f]">
            Recent Activity
          </h2>

          <button className="text-blue-600 font-medium flex items-center gap-1">
            View all <FiChevronRight />
          </button>
        </div>

        {/* TABLE */}
        <table className="w-full">
          {/* TABLE HEAD */}
          <thead>
            <tr className="bg-[#103c7f] text-white text-sm">
              <th className="text-left py-3 px-6 font-semibold uppercase tracking-wide">
                Time
              </th>
              <th className="text-left py-3 px-3 font-semibold uppercase tracking-wide">
                Recruiter
              </th>
              <th className="text-left py-3 px-3 font-semibold uppercase tracking-wide">
                Activity
              </th>
              <th className="text-left py-3 px-3 font-semibold uppercase tracking-wide">
                Details
              </th>
            </tr>
          </thead>

          {/* TABLE BODY */}
          <tbody className="text-gray-700 text-sm">
            <ActivityRow
              time="2 mins ago"
              recruiter="Sarah Johnson"
              icon={<FiDownload />}
              text="Downloaded resume"
              details="John Smith - Senior Java Developer"
            />

            <ActivityRow
              time="5 mins ago"
              recruiter="Mike Chen"
              icon={<FiSearch />}
              text="Searched"
              details="React Developer Bangalore 5+ years"
            />

            <ActivityRow
              time="8 mins ago"
              recruiter="Emily Davis"
              icon={<FiEye />}
              text="Viewed profile"
              details="Maria Garcia - Full Stack Engineer"
            />

            <ActivityRow
              time="12 mins ago"
              recruiter="James Wilson"
              icon={<FiLogIn />}
              text="Logged in"
              details="Logged in from Chrome/Windows"
            />

            <ActivityRow
              time="15 mins ago"
              recruiter="Sarah Johnson"
              icon={<FiSearch />}
              text="Searched"
              details="Python ML Engineer Remote"
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------------------------------
   REUSABLE COMPONENTS
-----------------------------------------*/

function DashboardCard({ icon, title, value, sub }) {
  return (
    <div
      className="border-2 border-gray-200 rounded-xl bg-[#10407e]/5 p-5 flex flex-col justify-between h-40 w-full"
    >
      {/* Top Section */}
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h2 className="text-3xl font-bold">{value}</h2>
          {sub && <p className="text-gray-500 text-sm mt-1">↑ {sub}</p>}
        </div>

        <div className="bg-[#103c7f] text-white p-3 rounded-lg text-xl">
          {icon}
        </div>
      </div>
    </div>
  );
}

function ListCard({ title, data }) {
  return (
    <div className="border border-gray-200 rounded-xl bg-white p-6">
      <h3 className="text-lg font-semibold text-[#103c7f] mb-4">{title}</h3>

      <ul className="space-y-4">
        {data.map((row, index) => (
          <li
            key={index}
            className="flex justify-between items-center text-gray-700"
          >
            {/* LEFT */}
            <div className="flex items-center gap-3">
              {/* Index Badge */}
              <span className="bg-[#10407e]/10 text-[#103c7f] font-semibold text-sm w-7 h-7 flex items-center justify-center rounded-full">
                {index + 1}
              </span>

              {/* Title */}
              <span className="text-gray-800 font-medium">{row[0]}</span>
            </div>

            {/* RIGHT VALUE */}
            <span className="text-[#103c7f] font-semibold">
              {row[1]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}


export const ActivityRow = ({ time, recruiter, icon, text, details }) => {
  return (
    <tr className="border-b last:border-0 border-gray-200">
      <td className="py-4 px-6">{time}</td>
      <td className="py-4 px-3">{recruiter}</td>

      <td className="py-4 px-3">
        <div className="flex items-center gap-2 text-blue-600">
          <span className="text-lg text-[#103c7f]">{icon}</span>
          <span className="hover:underline text-[#103c7f] cursor-pointer">
            {text}
          </span>
        </div>
      </td>

      <td className="py-4 px-3 text-gray-700">{details}</td>
    </tr>
  );
};
