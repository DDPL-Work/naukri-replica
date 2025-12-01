import React from "react";
import { FaEye, FaDownload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function ProfileCard({ data }) {
  const navigate = useNavigate();
  return (
    <div className="w-full border border-[#e4e7ec] rounded-2xl bg-white px-8 py-6 shadow-sm mb-6 ">
      {/* TOP ROW: NAME + BUTTONS */}
      <div className="flex items-start justify-between">
        {/* NAME + ROLE */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{data.name}</h3>
          <p className="text-gray-500 text-sm mt-1">{data.role}</p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col gap-3 items-end">
          {/* View Profile */}
          <button
            className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-md text-sm text-[#103c7f] hover:bg-gray-50"
            onClick={() => navigate("/candidate-profile")}
          >
            <FaEye className="text-[#103c7f] " /> View Profile
          </button>

          {/* Download */}
          <button className="flex items-center gap-2 bg-lime-500 text-white px-5 py-2 rounded-md text-sm hover:bg-lime-600">
            <FaDownload /> Download
          </button>
        </div>
      </div>

      {/* DETAILS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 mt-6 text-sm">
        <p>
          <span className="font-medium text-gray-600">Experience: </span>
          <span className="text-blue-700 cursor-pointer">
            {data.experience}
          </span>
        </p>

        <p>
          <span className="font-medium text-gray-600">CTC: </span>
          <span className="text-blue-700 cursor-pointer">{data.ctc}</span>
        </p>

        <p>
          <span className="font-medium text-gray-600">Company: </span>
          <span className="text-blue-700 cursor-pointer">{data.company}</span>
        </p>

        <p>
          <span className="font-medium text-gray-600">Location: </span>
          <span className="text-blue-700 cursor-pointer">{data.location}</span>
        </p>

        <p>
          <span className="font-medium text-gray-600">Portal Date: </span>
          <span className="text-gray-700">{data.postedOn}</span>
        </p>

        <p>
          <span className="font-medium text-gray-600">Apply Date: </span>
          <span className="text-gray-700">{data.applyDate}</span>
        </p>
      </div>

      {/* SKILLS */}
      <div className="flex flex-wrap gap-2 mt-5">
        {data.skills.map((skill, index) => (
          <span
            key={index}
            className="px-3 py-1 text-xs font-medium bg-[#eef2ff] text-[#3c4d9a] rounded-lg"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
