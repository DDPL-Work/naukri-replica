import React from "react";
import { FaEnvelope, FaPhone, FaSuitcase, FaUpload } from "react-icons/fa";
import { GrLocation } from "react-icons/gr";

export default function CandidateProfilePage() {
  return (
    <div className="w-full space-y-10">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Candidate Profile</h1>
        <p className="text-gray-500 text-sm mt-1">
          Detailed candidate information
        </p>
      </div>

      {/* PROFILE HEADER CARD */}
      <div className="border border-[#e5e7eb] rounded-xl bg-white shadow-sm">
        <div className="p-6 pb-2 bg-[#f6f7f9] rounded-t-xl">
          <h2 className="text-lg font-semibold text-gray-900">John Doe</h2>
          <p className="text-gray-500 text-sm mt-1">
            Senior Full Stack Developer
          </p>
        </div>

        <div className="p-6 pb-4">
          {/* EXPERIENCE + CTC ROW */}
          <div className="flex justify-between items-start text-sm">
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <span className="text-gray-600 flex items-center gap-1">
                  <FaSuitcase /> Experience:
                </span>
                <span className="text-blue-700 cursor-pointer font-medium">
                  8 years
                </span>
              </p>

              <p className="flex items-center gap-2">
                <span className="text-blue-700 cursor-pointer flex items-center gap-1">
                  <GrLocation className="text-gray-900" /> Bangalore, Karnataka
                </span>
              </p>
            </div>

            <div>
              <span className="text-gray-600">Current CTC: </span>
              <span className="text-blue-700 cursor-pointer font-medium">
                ₹25 LPA
              </span>
            </div>
          </div>

          {/* SKILLS */}
          <p className="mt-6 mb-2 font-medium text-gray-700">Skills</p>
          <div className="flex flex-wrap gap-2">
            {["React", "Node.js", "TypeScript", "AWS", "Docker", "MongoDB"].map(
              (skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-xs font-medium bg-[#103c7f] text-white rounded-xl"
                >
                  {skill}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* CONTACT INFORMATION */}
      <div className="border border-[#e5e7eb] rounded-xl bg-white shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Contact Information
        </h2>

        <div className="space-y-3 text-gray-700 text-sm">
          <p className="flex items-center gap-3">
            <FaEnvelope className="text-gray-600" /> john.doe@email.com
          </p>
          <p className="flex items-center gap-3">
            <FaPhone className="text-gray-600" /> +91 98765 43210
          </p>
        </div>
      </div>

      {/* EDUCATION */}
      <div className="border border-[#e5e7eb] rounded-xl bg-white shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Education</h2>

        <div className="space-y-6">
          <div className="border-l-2 border-[#103c7f] ">
            <div className="pl-3">
              <p className="font-semibold text-gray-900">
                B.Tech in Computer Science
              </p>
              <p className="text-gray-600">ABC University</p>
              <p className="text-gray-500 text-sm">2015</p>
            </div>
          </div>

          <div className="border-l-2 border-[#103c7f] ">
            <div className="pl-3">
              <p className="font-semibold text-gray-900">
                M.Tech in Software Engineering
              </p>
              <p className="text-gray-600">XYZ Institute</p>
              <p className="text-gray-500 text-sm">2017</p>
            </div>
          </div>
        </div>
      </div>

      {/* JD MATCH CV ANALYSIS */}
      <div className="border border-[#e5e7eb] rounded-xl bg-white shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          JD Match CV Analysis
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Upload or paste a Job Description to find matching candidate profiles
        </p>

        {/* Upload Box */}
        <div className="border border-dashed border-gray-300 rounded-lg py-3 text-center bg-[#fafafa]">
          <button className="flex items-center gap-2 text-blue-700 font-medium mx-auto">
            <FaUpload /> Upload PDF or DOCX
          </button>
        </div>

        <div className="flex items-center gap-0.5">
          <div className="border-t border-gray-200 w-72.5"></div>
          <p className="text-center  text-gray-400 text-xs mt-3 mb-3">
            OR PASTE TEXT
          </p>
          <div className="border-t border-gray-200 w-72.5"></div>
        </div>

        <textarea
          placeholder="Paste the complete job description here to analyze candidate match…"
          className="w-full border border-gray-300 rounded-lg p-1 bg-orange-50 h-20 focus:outline-none"
        />

        <button className="mt-4 bg-lime-500 hover:bg-lime-600 text-white px-6 py-2 rounded-md text-sm">
          Analyze Match
        </button>
      </div>

      {/* WORK EXPERIENCE */}
      <div className="border border-[#e5e7eb] rounded-xl bg-white shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Work Experience
        </h2>

        <div className="space-y-6">
          {/* Experience Item */}
          {[
            {
              role: "Senior Developer",
              company: "Tech Corp",
              period: "2021 - Present",
            },
            {
              role: "Full Stack Developer",
              company: "Digital Solutions",
              period: "2018 - 2021",
            },
            {
              role: "Junior Developer",
              company: "StartUp Inc",
              period: "2017 - 2018",
            },
          ].map((exp, i) => (
            <div key={i}>
              <div className="border-l-2 border-[#103c7f] ">
                <div className="pl-3">
                  <p className="font-semibold text-gray-900">{exp.role}</p>
                  <p className="text-gray-600">{exp.company}</p>
                  <p className="text-gray-500 text-sm">{exp.period}</p>
                </div>
              </div>
            </div>
          ))}

          {/* TIMELINE CARD */}
          <div className="border border-gray-300 rounded-lg bg-white p-4 w-120 mt-6">
            <p className="font-medium text-gray-900 mb-3">Timeline</p>

            <div className=" flex items-center gap-7">
              <p className="text-sm">
                <span className="font-medium text-gray-400">Apply Date:</span>{" "}
                <span className="text-blue-700">2025-01-10</span>
              </p>

              <p className="text-sm">
                <span className="font-medium text-gray-400">Portal Date:</span>{" "}
                <span className="text-blue-700">2025-01-15</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RECRUITER REMARKS */}
      <div className="border border-[#e5e7eb] rounded-xl bg-white shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recruiter Remarks
        </h2>

        <textarea
          placeholder="Add your remarks about this candidate…"
          className="w-full border border-gray-300 rounded-lg p-1 bg-orange-50 h-20 focus:outline-none"
        />

        <button className="mt-4 bg-lime-500 hover:bg-lime-600 text-white px-6 py-2 rounded-md text-sm">
          Save Remarks
        </button>
      </div>
    </div>
  );
}
