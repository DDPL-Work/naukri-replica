import { useDispatch, useSelector } from "react-redux";
import { normalizeCandidate } from "../../utils/normalizeCandidate";
import { useNavigate } from "react-router-dom";
import {
  clearDownloadError,
  downloadResumeThunk,
  setSearchState
} from "../../features/slices/recruiterSlice";
import { useEffect } from "react";
import { FaDownload, FaEye } from "react-icons/fa";
import toast from "react-hot-toast";

export default function ProfileCard({ data, searchState }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const candidate = normalizeCandidate(data);
  const id = candidate.id;

  const downloading = useSelector((s) => s.recruiter.downloading[id]);
  const downloadError = useSelector((s) => s.recruiter.downloadErrors[id]);

  useEffect(() => {
    if (downloadError) {
      toast.error(downloadError);
      dispatch(clearDownloadError(id));
    }
  }, [downloadError]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-bold">{candidate.displayName}</h3>
          <p className="text-zinc-500">{candidate.designation || "N/A"}</p>
        </div>

        <div className="flex flex-col gap-2">
          {/* VIEW PROFILE WITH STATE SAVE */}
          <button
            onClick={() => {
              dispatch(setSearchState(searchState)); 
              navigate(`/recruiter/candidate-profile/${id}`, {
                state: { prefill: searchState }
              });
            }}
            className="bg-stone-50 border border-gray-300 px-4 py-2 rounded-md flex items-center gap-2 text-blue-900"
          >
            <FaEye /> View Profile
          </button>

          {/* DOWNLOAD RESUME */}
          <button
            disabled={downloading}
            onClick={() => dispatch(downloadResumeThunk(id))}
            className={`px-5 py-2 rounded-md flex items-center gap-2 ${
              downloading ? "bg-gray-300" : "bg-lime-400"
            }`}
          >
            <FaDownload /> {downloading ? "Downloading…" : "Download"}
          </button>
        </div>
      </div>

      {/* EXPERIENCE / COMPANY / LOCATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 mt-4 text-sm">
        <p>
          <span className="text-zinc-500">Experience: </span>
          <span className="text-blue-900">{candidate.experience || 0} years</span>
        </p>

        <p>
          <span className="text-zinc-500">Company: </span>
          <span className="text-blue-900">
            {candidate.recentCompany || "—"}
          </span>
        </p>

        <p>
          <span className="text-zinc-500">Location: </span>
          <span className="text-blue-900">
            {candidate.location || "—"}
          </span>
        </p>
      </div>

      {/* SKILLS */}
      <div className="flex flex-wrap gap-2 mt-3">
        {candidate.skillsList.map((s, i) => (
          <span
            key={i}
            className="px-3 py-1 bg-gray-100 rounded-full text-blue-900 text-xs"
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
