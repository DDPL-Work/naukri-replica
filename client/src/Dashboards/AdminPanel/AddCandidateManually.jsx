import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addCandidateManual,
  resetManualAddState,
} from "../../features/slices/adminSlice";

import { jwtDecode } from "jwt-decode";
import axios from "axios";
import toast from "react-hot-toast";

import {
  FiUploadCloud,
  FiTrash2,
  FiCalendar,
  FiPlus,
  FiX,
} from "react-icons/fi";
import { FaChevronDown } from "react-icons/fa";

/* ------------------------------------------
   DROPDOWN OPTIONS
------------------------------------------- */
const DEGREE_OPTIONS = [
  "10th",
  "12th",
  "Diploma",
  "B.Tech",
  "B.E",
  "B.Sc",
  "BCA",
  "B.Com",
  "BBA",
  "BA",
  "B.Arch",
  "B.Pharm",
  "B.Ed",
  "M.Tech",
  "M.E",
  "M.Sc",
  "MCA",
  "M.Com",
  "MBA",
  "MA",
  "M.Arch",
  "M.Ed",
  "PhD",
  "Other",
];

const DESIGNATION_OPTIONS = [
  "Software Engineer",
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "React Developer",
  "Node.js Developer",
  "Java Developer",
  "Python Developer",
  "Data Analyst",
  "Business Analyst",
  "QA Tester",
  "Android Developer",
  "iOS Developer",
  "DevOps Engineer",
  "ML Engineer",
  "Project Manager",
  "Scrum Master",
  "UI/UX Designer",
  "HR Recruiter",
  "Sales Executive",
  "Customer Support",
  "Digital Marketer",
  "Network Engineer",
];

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const PORTAL_OPTIONS = ["Naukri", "LinkedIn", "Indeed", "Referral", "Other"];

export default function AddCandidateManually() {
  const dispatch = useDispatch();

  const { manualAddLoading, manualAddSuccess, manualAddError } = useSelector(
    (state) => state.admin
  );

  const [isAdmin, setIsAdmin] = useState(false);

  /* ------------------------------------------
      PDF FILE
  ------------------------------------------- */
  const [pdfFile, setPdfFile] = useState(null);

  /* ------------------------------------------
      FORM DATA — all fields from Mongoose model
  ------------------------------------------- */
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    gender: "",
    location: "",
    qualification: "",
    resumeUrl: "",
    portal: "",
    portalDate: "",
    experience: "",
    relevantExp: "",
    designation: "",
    recentCompany: "",
    applyDate: "",
    callingDate: "",
    currCTC: "",
    expCTC: "",
    feedback: "",
    remark: "",
    jdBrief: "",
  });

  const [errors, setErrors] = useState({});

  /* ------------------------------------------
      TAG INPUTS
  ------------------------------------------- */
  const [topSkills, setTopSkills] = useState([]);
  const [skillsAll, setSkillsAll] = useState([]);
  const [companiesAll, setCompaniesAll] = useState([]);

  /* ------------------------------------------
      EDUCATION ARRAY
  ------------------------------------------- */
  const [education, setEducation] = useState([
    { degree: "", institute: "", passingYear: "", score: "" },
  ]);

  const addEducation = () => {
    setEducation((prev) => [
      ...prev,
      { degree: "", institute: "", passingYear: "", score: "" },
    ]);
  };

  const updateEducation = (i, key, value) => {
    const updated = [...education];
    updated[i][key] = value;
    setEducation(updated);
  };

  const removeEducation = (index) => {
    if (education.length === 1) return;
    setEducation((prev) => prev.filter((_, i) => i !== index));
  };

  /* ------------------------------------------
      VERIFY ADMIN
  ------------------------------------------- */
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      toast.error("Admin login required");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.role === "ADMIN") {
        setIsAdmin(true);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } else {
        toast.error("Admin access required");
      }
    } catch {
      toast.error("Invalid token");
    }
  }, []);

  /* ------------------------------------------
      FORM VALIDATION
  ------------------------------------------- */
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name required";
    if (!formData.mobile.trim()) newErrors.mobile = "Mobile required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ------------------------------------------
      SUBMIT
  ------------------------------------------- */
  const handleSubmit = () => {
    if (!validate()) return;

    const fd = new FormData();
    Object.entries(formData).forEach(([key, value]) =>
      fd.append(key, value || "")
    );

    fd.append("topSkills", JSON.stringify(topSkills));
    fd.append("skillsAll", JSON.stringify(skillsAll));
    fd.append("companyNamesAll", JSON.stringify(companiesAll));
    fd.append("education", JSON.stringify(education));

    if (pdfFile) fd.append("pdfFile", pdfFile);

    dispatch(addCandidateManual(fd));
  };

  /* ------------------------------------------
      SUCCESS HANDLER
  ------------------------------------------- */
  useEffect(() => {
    if (manualAddSuccess) {
      toast.success("Candidate added successfully");

      setFormData({
        name: "",
        email: "",
        mobile: "",
        gender: "",
        location: "",
        qualification: "",
        resumeUrl: "",
        portal: "",
        portalDate: "",
        experience: "",
        relevantExp: "",
        designation: "",
        recentCompany: "",
        applyDate: "",
        callingDate: "",
        currCTC: "",
        expCTC: "",
        feedback: "",
        remark: "",
        jdBrief: "",
      });

      setTopSkills([]);
      setSkillsAll([]);
      setCompaniesAll([]);
      setEducation([{ degree: "", institute: "", passingYear: "", score: "" }]);
      dispatch(resetManualAddState());
    }

    if (manualAddError) toast.error(manualAddError);
  }, [manualAddSuccess, manualAddError]);

  /* ------------------------------------------
      UI
  ------------------------------------------- */
  if (!isAdmin)
    return (
      <div className="p-8 text-center text-red-600 text-xl">
        Admin access required
      </div>
    );

  return (
    <div className="w-full min-h-screen bg-white px-8 pb-20">
      <h1 className="text-4xl font-bold font-serif mt-6 mb-1">
        Add Candidate Manually
      </h1>
      <p className="text-zinc-500 text-lg mb-8">
        Fill candidate details and upload resume
      </p>

      <div className="border border-gray-200 rounded-xl p-6 max-w-[1100px]">
        {/* BASIC GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Input
            label="Full Name *"
            error={errors.name}
            value={formData.name}
            onChange={(v) => setFormData({ ...formData, name: v })}
          />
          <Input
            label="Email"
            value={formData.email}
            onChange={(v) => setFormData({ ...formData, email: v })}
          />
          <Input
            label="Mobile *"
            error={errors.mobile}
            value={formData.mobile}
            onChange={(v) => setFormData({ ...formData, mobile: v })}
          />

          <Dropdown
            label="Gender"
            value={formData.gender}
            options={GENDER_OPTIONS}
            onChange={(v) => setFormData({ ...formData, gender: v })}
          />

          <Dropdown
            label="Highest Qualification"
            value={formData.qualification}
            options={DEGREE_OPTIONS}
            onChange={(v) => setFormData({ ...formData, qualification: v })}
          />

          <Dropdown
            label="Designation"
            value={formData.designation}
            options={DESIGNATION_OPTIONS}
            onChange={(v) => setFormData({ ...formData, designation: v })}
          />

          <Input
            label="Location"
            value={formData.location}
            onChange={(v) => setFormData({ ...formData, location: v })}
          />

          <Input
            label="Experience (e.g., 2 years)"
            value={formData.experience}
            onChange={(v) => setFormData({ ...formData, experience: v })}
          />

          <Input
            label="Relevant Exp (Years)"
            value={formData.relevantExp}
            onChange={(v) => setFormData({ ...formData, relevantExp: v })}
          />

          <Input
            label="Recent Company"
            value={formData.recentCompany}
            onChange={(v) => setFormData({ ...formData, recentCompany: v })}
          />

          <Dropdown
            label="Portal"
            options={PORTAL_OPTIONS}
            value={formData.portal}
            onChange={(v) => setFormData({ ...formData, portal: v })}
          />

          <Input
            label="Portal Date"
            type="date"
            value={formData.portalDate}
            onChange={(v) => setFormData({ ...formData, portalDate: v })}
          />

          <Input
            label="Apply Date"
            type="date"
            value={formData.applyDate}
            onChange={(v) => setFormData({ ...formData, applyDate: v })}
          />

          <Input
            label="Calling Date"
            type="date"
            value={formData.callingDate}
            onChange={(v) => setFormData({ ...formData, callingDate: v })}
          />

          <Input
            label="Current CTC"
            value={formData.currCTC}
            onChange={(v) => setFormData({ ...formData, currCTC: v })}
          />

          <Input
            label="Expected CTC"
            value={formData.expCTC}
            onChange={(v) => setFormData({ ...formData, expCTC: v })}
          />

          <Input
            label="Resume URL (Google Drive)"
            value={formData.resumeUrl}
            onChange={(v) => setFormData({ ...formData, resumeUrl: v })}
          />

          {/* PDF UPLOAD */}
          <div>
            <label className="text-sm mb-1 block font-medium">
              Upload PDF Resume
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfFile(e.target.files[0])}
              className="w-full border text-[#808080] border-gray-200 rounded-md px-3 h-10 bg-[#FCFBF8]"
            />
          </div>
        </div>

        {/* EDUCATION */}
        <h2 className="text-xl font-semibold mt-10 mb-3">Education Details</h2>

        {education.map((item, idx) => (
          <div
            key={idx}
            className="border border-gray-200 rounded-md p-4 mb-4 relative"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Dropdown
                label="Degree"
                options={DEGREE_OPTIONS}
                value={item.degree}
                onChange={(v) => updateEducation(idx, "degree", v)}
              />
              <Input
                label="Institute"
                value={item.institute}
                onChange={(v) => updateEducation(idx, "institute", v)}
              />
              <Input
                label="Passing Year"
                value={item.passingYear}
                onChange={(v) => updateEducation(idx, "passingYear", v)}
              />
              <Input
                label="Score (CGPA/%)"
                value={item.score}
                onChange={(v) => updateEducation(idx, "score", v)}
              />
            </div>

            {education.length > 1 && (
              <button
                onClick={() => removeEducation(idx)}
                className="absolute top-3 right-3 text-red-500"
              >
                <FiTrash2 />
              </button>
            )}
          </div>
        ))}

        <button
          onClick={addEducation}
          className="text-blue-700 font-medium flex items-center gap-2 text-sm mb-6"
        >
          <FiPlus /> Add More Education
        </button>

        {/* TAG INPUT SECTIONS */}
        <TagInput
          label="Top Skills"
          items={topSkills}
          setItems={setTopSkills}
        />
        <TagInput
          label="All Skills"
          items={skillsAll}
          setItems={setSkillsAll}
        />
        <TagInput
          label="All Companies"
          items={companiesAll}
          setItems={setCompaniesAll}
        />

        {/* FEEDBACK, REMARK, JD BRIEF */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <TextArea
            label="Feedback"
            value={formData.feedback}
            onChange={(v) => setFormData({ ...formData, feedback: v })}
          />
          <TextArea
            label="Remark"
            value={formData.remark}
            onChange={(v) => setFormData({ ...formData, remark: v })}
          />
        </div>

        <TextArea
          label="JD Brief"
          value={formData.jdBrief}
          onChange={(v) => setFormData({ ...formData, jdBrief: v })}
        />

        {/* SUBMIT */}
        <button
          disabled={manualAddLoading}
          onClick={handleSubmit}
          className={`mt-10 px-6 py-2 bg-[#A1DB40] rounded-md ${
            manualAddLoading ? "opacity-60" : ""
          }`}
        >
          {manualAddLoading ? "Saving..." : "Add Candidate"}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------
   REUSABLE UI COMPONENTS
------------------------------------------- */

function Input({ label, value, onChange, error, type = "text" }) {
  return (
    <div>
      <label className="text-sm mb-1 block font-medium ">{label}</label>
      <input
        type={type}
        className="w-full border text-[#808080] border-gray-200 rounded-md px-3 h-10 bg-[#FCFBF8]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="text-red-600 text-xs">{error}</p>}
    </div>
  );
}

function Dropdown({ label, options, value, onChange }) {
  return (
    <div className="relative">
      <label className="text-sm font-medium mb-1 block">{label}</label>

      <div className="relative">
        {/* Select Box */}
        <select
          className="
            w-full border border-gray-200 rounded-md px-3 pr-10 h-10 
            bg-[#FCFBF8] text-[#808080]
            appearance-none
          "
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select</option>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>

        {/* Custom Dropdown Arrow */}
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
          <FaChevronDown />
        </span>
      </div>
    </div>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <div className="mt-6">
      <label className="text-sm mb-1 block font-medium ">{label}</label>
      <textarea
        rows={4}
        className="w-full border text-[#808080] border-gray-200 rounded-md px-3 py-2 bg-[#FCFBF8]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function TagInput({ label, items, setItems }) {
  return (
    <div className="mt-6">
      <label className="text-sm block mb-2 font-medium ">{label}</label>

      <input
        className="w-full border text-[#808080] border-gray-200 rounded-md px-3 h-10 bg-[#FCFBF8]"
        placeholder="Type and press Enter"
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.target.value.trim() !== "") {
            setItems([...items, e.target.value.trim()]);
            e.target.value = "";
            e.preventDefault();
          }
        }}
      />

      <div className="flex flex-wrap gap-2 mt-2">
        {items.map((item, i) => (
          <span
            key={i}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center gap-2"
          >
            {item}
            <FiX
              className="cursor-pointer"
              onClick={() =>
                setItems((prev) => prev.filter((_, idx) => idx !== i))
              }
            />
          </span>
        ))}
      </div>
    </div>
  );
}
