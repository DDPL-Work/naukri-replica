import React from "react";
import { FaEye, FaDownload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { downloadResumeThunk } from "../../features/slices/recruiterSlice";

export default function ProfileCard({ data }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { resumeDownloading } = useSelector((state) => state.recruiter);

  const id = data._id || data.candidateId;

  const handleDownload = () => {
    dispatch(downloadResumeThunk(id));
  };

  const skills =
    data.skills?.length > 0
      ? data.skills
      : data.topSkills?.length > 0
      ? data.topSkills
      : [];

  return (
    <div className="bg-white rounded-lg  outline-1 outline-zinc-200 shadow-sm p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        {" "}
        {/* NAME + ROLE */}
        <div>
          <h3 className="text-lg font-bold font-['Calibri'] text-black leading-7">
            {data.fullName || "Unknown"}
          </h3>
          <p className="text-zinc-500 text-base font-['Calibri'] leading-6">
            {data.designation || "Not available"}
          </p>
        </div>
        {/* ACTION BUTTONS */}
        <div className="flex flex-col gap-3 mt-3">
          <button
            onClick={() => navigate(`/recruiter/candidate-profile/${id}`)}
            className="bg-stone-50  outline-1 outline-zinc-200 rounded-md px-4 py-2 flex items-center gap-2 text-blue-900 text-sm font-['Calibri']"
          >
            <FaEye /> View Profile
          </button>

          <button
            disabled={resumeDownloading}
            onClick={handleDownload}
            className="bg-lime-400 rounded-md px-5 py-2 flex items-center gap-2 text-black text-sm font-['Calibri'] disabled:bg-gray-300"
          >
            <FaDownload /> Download
          </button>
        </div>
      </div>

      {/* DETAILS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 text-sm font-['Calibri']">
        <p>
          <span className="text-zinc-500">Experience: </span>
          <span className="text-blue-900">{data.experience || 0} years</span>
        </p>

        <p>
          <span className="text-zinc-500">CTC: </span>
          <span className="text-blue-900">
            {data.ctcExpected || data.ctcCurrent || "—"}
          </span>
        </p>

        <p>
          <span className="text-zinc-500">Company: </span>
          <span className="text-blue-900">{data.recentCompany || "—"}</span>
        </p>

        <p>
          <span className="text-zinc-500">Location: </span>
          <span className="text-blue-900">{data.location || "—"}</span>
        </p>

        <p>
          <span className="text-zinc-500">Portal Date: </span>
          <span className="text-blue-900">
            {new Date(data.portalDate).toISOString().split("T")[0]}
          </span>
        </p>

        <p>
          <span className="text-zinc-500">Apply Date: </span>
          <span className="text-blue-900">
            {data.applyDate
              ? new Date(data.applyDate).toISOString().split("T")[0]
              : "—"}
          </span>
        </p>
      </div>

      {/* SKILLS */}
      <div className="flex flex-wrap gap-2 mt-2">
        {skills.map((s) => (
          <span
            key={s}
            className="px-2.5 py-0.5 bg-gray-100 rounded-full text-blue-900 text-xs font-bold font-['Calibri']"
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
