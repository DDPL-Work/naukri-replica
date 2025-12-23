import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { FaEnvelope, FaPhone, FaSuitcase, FaDownload } from "react-icons/fa";
import { GrLocation } from "react-icons/gr";

import {
  downloadResumeThunk,
  getCandidateById,
  updateCandidateFeedback,
  viewResumeThunk,
} from "../../features/slices/recruiterSlice";

import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

export default function CandidateProfilePage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const Location = useLocation();

  const {
    candidateLoading,
    candidateError,
    candidateData: candidate,
  } = useSelector((state) => state.recruiter);

  // INPUT FOR NEW REMARK
  const [remarkInput, setRemarkInput] = useState("");

  // STORE LOGGED-IN RECRUITER DETAILS
  const [recruiterInfo, setRecruiterInfo] = useState({
    name: "Unknown Recruiter",
    email: "unknown@example.com",
  });

  // Extract recruiter details from session token
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);

        setRecruiterInfo({
          name: decoded.name || decoded.fullName || "Recruiter",
          email: decoded.email || decoded.username || "unknown@example.com",
        });
      } catch (err) {
        console.error("Invalid Token");
      }
    }
  }, []);

  // Fetch candidate details
  useEffect(() => {
    if (id) dispatch(getCandidateById(id));
  }, [id, dispatch]);

  // SAFETY FALLBACK WHEN CANDIDATE NOT FOUND
  if (candidateLoading) return <p>Loading...</p>;
  if (candidateError) return <p>Error: {candidateError}</p>;
  if (!candidate) return <p>Candidate Not Found</p>;

  // -------------------------
  // NORMALIZED CANDIDATE FIELDS
  // -------------------------
  const name =
    candidate.fullName ||
    candidate.name ||
    candidate.candidateName ||
    (candidate.firstName && candidate.lastName
      ? `${candidate.firstName} ${candidate.lastName}`
      : null) ||
    candidate.source?.fullName ||
    "Unknown";

  const designation = candidate.designation || "Not Available";

  const experience = candidate.experience
    ? candidate.experience
    : candidate.relevantExp
    ? `${candidate.relevantExp} Years`
    : "—";

  const location = candidate.location || "—";
  const company = candidate.recentCompany || "—";

  const ctcCurrent = candidate.currCTC ? `${candidate.currCTC} LPA` : "—";
  const ctcExpected = candidate.expCTC ? `${candidate.expCTC} LPA` : "—";

  const portalDate = candidate.portalDate
    ? new Date(candidate.portalDate).toISOString().split("T")[0]
    : "—";

  const applyDate = candidate.applyDate
    ? new Date(candidate.applyDate).toISOString().split("T")[0]
    : "—";

  const skills =
    candidate.skillsAll?.length > 0
      ? candidate.skillsAll
      : candidate.topSkills?.length > 0
      ? candidate.topSkills
      : [];

  const education = candidate.education || [];

  // Work experience fallback
  const inferredWorkExp = [];
  if (candidate.relevantExp || candidate.experience) {
    inferredWorkExp.push({
      role: designation,
      company: company,
      period: applyDate !== "—" ? `Since ${applyDate}` : "—",
    });
  }

  // Remarks list (array)
  const remarksList = candidate.remarks || [];

  // View resume
  const handleResumeView = async (candidateId) => {
    try {
      const res = await dispatch(viewResumeThunk(candidateId)).unwrap();
      window.open(res.resumeUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(
        error || "Resume viewed failed. Maybe daily limit reached."
      );
    }
  };

  // Add new remark
  const saveRemarks = () => {
    if (!remarkInput.trim()) return toast.error("Remark cannot be empty");

    const newRemark = {
      text: remarkInput.trim(),
      email: recruiterInfo.email,
      name: recruiterInfo.name,
      date: new Date().toISOString(),
    };

    dispatch(updateCandidateFeedback({ id, remark: newRemark }))
      .unwrap()
      .then(() => {
        toast.success("Remark Added");
        setRemarkInput("");
        dispatch(getCandidateById(id)); // refresh fresh data
      })
      .catch(() => toast.error("Failed to update remarks"));
  };

  return (
    <div className="w-full space-y-10">
      <div className="flex items-center justify-between">
        {/* PAGE HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Candidate Profile
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Detailed candidate information
          </p>
        </div>
        {/* BACK BUTTON */}
        <button
          onClick={() =>
            navigate("/recruiter/candidate-search", {
              state: { prefill: Location.state?.prefill },
            })
          }
          className="bg-stone-100 px-4 py-2 rounded-md border hover:bg-stone-200"
        >
          Back to Search
        </button>
      </div>

      {/* PROFILE CARD */}
      <div className="border border-gray-200 rounded-xl bg-white shadow-sm">
        <div className="p-6 bg-[#f6f7f9] rounded-t-xl flex justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{name}</h2>
            <p className="text-gray-500 text-sm mt-1">{designation}</p>
          </div>

          {candidate && (
            <button
              onClick={() => handleResumeView(candidate._id)}
              className="flex items-center gap-2 bg-lime-500 text-white px-4 py-2 rounded-md hover:bg-lime-600"
            >
              <FaDownload /> Resume
            </button>
          )}
        </div>

        <div className="p-6">
          <div className="flex justify-between text-sm">
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <FaSuitcase className="text-gray-600" />
                <span className="text-gray-700">Experience:</span>
                <span className="text-blue-700 font-medium">{experience}</span>
              </p>

              <p className="flex items-center gap-2">
                <GrLocation className="text-gray-600" />
                <span className="text-blue-700">{location}</span>
              </p>
            </div>

            <div className="space-y-1 text-right">
              <p>
                <span className="text-gray-600">Current CTC:</span>{" "}
                <span className="text-blue-700 font-medium">{ctcCurrent}</span>
              </p>
              <p>
                <span className="text-gray-600">Expected CTC:</span>{" "}
                <span className="text-blue-700 font-medium">{ctcExpected}</span>
              </p>
            </div>
          </div>

          {/* SKILLS */}
          <p className="mt-6 mb-2 font-medium text-gray-700">Skills</p>
          <div className="flex flex-wrap gap-2">
            {skills.length > 0 ? (
              skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-xs bg-[#103c7f] text-white rounded-xl"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-gray-500">No skills listed</p>
            )}
          </div>
        </div>
      </div>

      {/* CONTACT INFORMATION */}
      {/* <div className="border border-gray-200 rounded-xl bg-white shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Contact Information</h2>

        <div className="space-y-3">
          <p className="flex items-center gap-3">
            <FaEnvelope className="text-gray-600" />
            {candidate.email || "Not Provided"}
          </p>

          <p className="flex items-center gap-3">
            <FaPhone className="text-gray-600" />
            {candidate.mobile || "Not Provided"}
          </p>
        </div>
      </div> */}

      {/* EDUCATION */}
      <div className="border border-gray-200 rounded-xl bg-white shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Education</h2>

        {education.length > 0 ? (
          education.map((edu, i) => (
            <div key={i} className="border-l-2 border-[#103c7f] pl-3 mb-4">
              <p className="font-semibold">{edu.degree}</p>
              <p className="text-gray-600">{edu.institute}</p>
              <p className="text-gray-600">Passing Year: {edu.passingYear}</p>
              <p className="text-gray-600">Score: {edu.score}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No education data available</p>
        )}
      </div>

      {/* WORK EXPERIENCE */}
      <div className="border border-gray-200 rounded-xl bg-white shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Work Experience</h2>

        {inferredWorkExp.length > 0 ? (
          inferredWorkExp.map((exp, i) => (
            <div key={i} className="border-l-2 pl-3 border-[#103c7f] mb-4">
              <p className="font-semibold">{exp.role}</p>
              <p className="text-gray-600">{exp.company}</p>
              <p className="text-gray-500 text-sm">{exp.period}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No work experience provided</p>
        )}
      </div>

      {/* RECRUITER REMARK INPUT */}
      <div className="border border-gray-200 rounded-xl bg-white shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Add Remarks</h2>

        <textarea
          value={remarkInput}
          onChange={(e) => setRemarkInput(e.target.value)}
          placeholder="Write your remark here..."
          className="w-full focus:outline-0 rounded-lg bg-orange-50 h-24 p-3"
        />

        <button
          onClick={saveRemarks}
          className="mt-4 bg-lime-500 hover:bg-lime-600 text-white px-6 py-2 rounded-md"
        >
          Save Remark
        </button>
      </div>

      {/* REMARKS HISTORY */}
      <div className="border border-gray-200 rounded-xl bg-white shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Remarks History</h2>

        {remarksList.length > 0 ? (
          <div className="space-y-4">
            {remarksList.map((r, i) => (
              <div
                key={i}
                className="border border-gray-300 p-3 rounded-lg bg-gray-50"
              >
                <p className="text-gray-800">{r.text}</p>
                <p className="text-xs text-gray-500 mt-2">
                  By: <span className="font-medium">{r.name}</span> ({r.email})
                  • {new Date(r.date).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No remarks yet</p>
        )}
      </div>
    </div>
  );
}
