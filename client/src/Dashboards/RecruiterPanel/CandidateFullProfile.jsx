import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { FaEnvelope, FaPhone, FaSuitcase, FaDownload } from "react-icons/fa";
import { GrLocation } from "react-icons/gr";

import {
  downloadResumeThunk,
  getCandidateById,
  updateCandidateFeedback,
} from "../../features/slices/recruiterSlice";
import toast from "react-hot-toast";

export default function CandidateProfilePage() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const {
    candidateLoading,
    candidateError,
    candidateData: candidate,
  } = useSelector((state) => state.recruiter);

  const [remark, setRemark] = useState("");

  // Fetch candidate data
  useEffect(() => {
    if (id) {
      dispatch(getCandidateById(id));
    }
  }, [id, dispatch]);

  // Populate remarks after loading candidate
  useEffect(() => {
    if (candidate) setRemark(candidate.remark || "");
  }, [candidate]);

  // Save Feedback / Remark
  const saveRemarks = () => {
    dispatch(updateCandidateFeedback({ id, remark }))
      .unwrap()
      .then(() => toast.success("Remarks Updated"))
      .catch(() => toast.error("Failed to update remarks"));
  };

  if (candidateLoading) return <p>Loading...</p>;
  if (candidateError) return <p>Error: {candidateError}</p>;
  if (!candidate) return <p>Candidate Not Found</p>;

  // -----------------------------------------------------
  // NORMALIZED FIELDS BASED ON YOUR CANDIDATE MODEL
  // -----------------------------------------------------
  const fullName = candidate.name || "Unknown";

  const designation = candidate.designation || "Not Available";

  const experience = candidate.experience
    ? candidate.experience
    : candidate.relevantExp
    ? `${candidate.relevantExp} Years`
    : "—";

  const location = candidate.location || "—";

  const ctcCurrent = candidate.currCTC ? `${candidate.currCTC} LPA` : "—";
  const ctcExpected = candidate.expCTC ? `${candidate.expCTC} LPA` : "—";

  const company = candidate.recentCompany || "—";

  const portalDate = candidate.portalDate
    ? new Date(candidate.portalDate).toISOString().split("T")[0]
    : "—";

  const applyDate = candidate.applyDate
    ? new Date(candidate.applyDate).toISOString().split("T")[0]
    : "—";

  const skills =
    candidate.skillsAll && candidate.skillsAll.length > 0
      ? candidate.skillsAll
      : candidate.topSkills && candidate.topSkills.length > 0
      ? candidate.topSkills
      : [];

  // Normalize Cloudinary URL for inline PDF viewing
  let resumeUrl = candidate.pdfFile || candidate.resumeUrl || null;

  if (resumeUrl && resumeUrl.includes("/upload/")) {
    resumeUrl = resumeUrl.replace("/upload/", "/upload/fl_attachment:false/");
  }

  const education = candidate.education || [];

  // Work experience fallback logic
  const inferredWorkExp = [];

  if (candidate.relevantExp || candidate.experience) {
    inferredWorkExp.push({
      role: designation,
      company: candidate.recentCompany,
      period: applyDate !== "—" ? `Since ${applyDate}` : "—",
    });
  }

  const handleResumeDownload = async (candidateId) => {
    try {
      const res = await dispatch(downloadResumeThunk(candidateId)).unwrap();
      window.open(res.resumeUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(
        error || "Resume download failed. Maybe daily limit reached."
      );
    }
  };

  return (
    <div className="w-full space-y-10">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Candidate Profile</h1>
        <p className="text-gray-500 text-sm mt-1">
          Detailed candidate information
        </p>
      </div>

      {/* PROFILE CARD */}
      <div className="border border-gray-200 rounded-xl bg-white shadow-sm">
        {/* TOP HEADER */}
        <div className="p-6 bg-[#f6f7f9] rounded-t-xl flex justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{fullName}</h2>
            <p className="text-gray-500 text-sm mt-1">{designation}</p>
          </div>

          {candidate && (
            <button
              onClick={() => handleResumeDownload(candidate._id)}
              className="flex items-center gap-2 bg-lime-500 text-white px-4 py-2 rounded-md hover:bg-lime-600"
            >
              <FaDownload /> Resume
            </button>
          )}
        </div>

        {/* INFO GRID */}
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
      <div className="border border-gray-200 rounded-xl bg-white shadow-sm p-6">
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
      </div>

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

      {/* RECRUITER REMARKS */}
      <div className="border border-gray-200 rounded-xl bg-white shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Recruiter Remarks</h2>

        <textarea
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          className="w-full border rounded-lg bg-orange-50 h-20 p-2"
        />

        <button
          onClick={saveRemarks}
          className="mt-4 bg-lime-500 hover:bg-lime-600 text-white px-6 py-2 rounded-md"
        >
          Save Remarks
        </button>
      </div>
    </div>
  );
}
