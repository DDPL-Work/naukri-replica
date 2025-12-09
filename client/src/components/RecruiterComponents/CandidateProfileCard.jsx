import React, { useEffect } from "react";
import { FaEye, FaDownload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  downloadResumeThunk,
  clearDownloadError,
} from "../../features/slices/recruiterSlice";

export default function ProfileCard({ data }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Normalize candidate object
  const candidate = { ...data, ...(data.source || {}) };
  const id = candidate._id || candidate.candidateId;

  const downloading = useSelector((s) => s.recruiter.downloading[id]);
  const downloadError = useSelector((s) => s.recruiter.downloadErrors[id]);

  const skills =
    candidate.skills?.length
      ? candidate.skills
      : candidate.topSkills?.length
      ? candidate.topSkills
      : [];

  // Show download limit exceeded toast
  useEffect(() => {
    if (downloadError) {
      toast.error(downloadError);
      dispatch(clearDownloadError(id));
    }
  }, [downloadError]);

  const handleDownload = () => {
    if (downloading) return;

    dispatch(downloadResumeThunk(id));
  };

  return (
    <div className="bg-white rounded-lg  outline-1 outline-zinc-200 shadow-sm p-6 flex flex-col gap-4">

      {/* NAME + BUTTONS */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">{candidate.fullName || "Unknown"}</h3>
          <p className="text-zinc-500">{candidate.designation || "Not available"}</p>
        </div>

        <div className="flex flex-col gap-3 mt-3">
          <button
            onClick={() => navigate(`/recruiter/candidate-profile/${id}`)}
            className="bg-stone-50  outline-1 outline-gray-200 rounded-md px-4 py-2 flex items-center gap-2 text-blue-900 text-sm"
          >
            <FaEye /> View Profile
          </button>

          <button
            disabled={downloading}
            onClick={handleDownload}
            className={`rounded-md px-5 py-2 flex items-center gap-2 text-black text-sm 
              ${downloading ? "bg-gray-300" : "bg-lime-400"}`}
          >
            <FaDownload />
            {downloading ? "Downloading…" : "Download"}
          </button>
        </div>
      </div>

      {/* DETAILS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 text-sm">
        <p>
          <span className="text-zinc-500">Experience: </span>
          <span className="text-blue-900">{candidate.experience || 0} years</span>
        </p>

        <p>
          <span className="text-zinc-500">CTC: </span>
          <span className="text-blue-900">
            {candidate.ctcExpected || candidate.ctcCurrent || "—"}
          </span>
        </p>

        <p>
          <span className="text-zinc-500">Company: </span>
          <span className="text-blue-900">{candidate.recentCompany || "—"}</span>
        </p>

        <p>
          <span className="text-zinc-500">Location: </span>
          <span className="text-blue-900">{candidate.location || "—"}</span>
        </p>

        <p>
          <span className="text-zinc-500">Portal Date: </span>
          <span className="text-blue-900">
            {candidate.portalDate
              ? new Date(candidate.portalDate).toISOString().split("T")[0]
              : "—"}
          </span>
        </p>

        <p>
          <span className="text-zinc-500">Apply Date: </span>
          <span className="text-blue-900">
            {candidate.applyDate
              ? new Date(candidate.applyDate).toISOString().split("T")[0]
              : "—"}
          </span>
        </p>
      </div>

      {/* SKILLS */}
      <div className="flex flex-wrap gap-2 mt-2">
        {skills.map((s, i) => (
          <span
            key={i}
            className="px-2.5 py-1 bg-gray-100 rounded-full text-blue-900 text-xs font-bold"
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
