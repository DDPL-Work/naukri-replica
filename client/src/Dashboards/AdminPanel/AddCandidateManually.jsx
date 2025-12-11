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

import {
  LOCATION_OPTIONS,
  DESIGNATION_OPTIONS,
  DEGREE_OPTIONS,
  GENDER_OPTIONS,
  PORTAL_OPTIONS,
} from "../../Data/DummyData.js";

/* ------------------------------------------
   OPTIONS
------------------------------------------- */

/* ------------------------------------------
   MAIN COMPONENT
------------------------------------------- */
export default function AddCandidateManually() {
  const dispatch = useDispatch();
  const { manualAddLoading, manualAddSuccess, manualAddError } = useSelector(
    (state) => state.admin
  );

  const [isAdmin, setIsAdmin] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    gender: "",
    location: "",
    qualification: "",
    portal: "",
    portalDate: "",
    experience: "",
    relevantExp: "",
    designation: "",
    customDesignation: "", // for "Other"
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

  const [topSkills, setTopSkills] = useState([]);
  const [skillsAll, setSkillsAll] = useState([]);
  const [companiesAll, setCompaniesAll] = useState([]);

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
     VALIDATION
  ------------------------------------------- */
  const validate = () => {
    const newErrors = {};

    // Name
    if (!formData.name.trim()) newErrors.name = "Name is required";

    // Email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }

    // Mobile (10 digits)
    const mobileClean = (formData.mobile || "").toString().replace(/\D/g, "");
    if (!mobileClean) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(mobileClean)) {
      newErrors.mobile = "Enter a valid 10-digit mobile number";
    }

    if (!formData.designation.trim()) {
      newErrors.designation = "Designation is required";
    }

    if (!formData.qualification.trim()) {
      newErrors.qualification = "Qualification is required";
    }

    if (
      formData.designation === "Other" &&
      !formData.customDesignation.trim()
    ) {
      newErrors.customDesignation = "Please enter designation";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    // PDF file required
    if (!pdfFile) newErrors.pdfFile = "Resume PDF is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ------------------------------------------
     SUBMIT
  ------------------------------------------- */
  const handleSubmit = () => {
    if (!validate()) return;

    const fd = new FormData();

    // Final designation
    const finalDesignation =
      formData.designation === "Other"
        ? formData.customDesignation
        : formData.designation;

    // Append ONLY ONCE (prevent duplication)
    fd.append("name", formData.name);
    fd.append("email", formData.email);
    fd.append("mobile", formData.mobile);
    fd.append("gender", formData.gender);
    fd.append("location", formData.location);

    // EXACTLY as backend model requires (STRING)
    fd.append("qualification", formData.qualification);
    fd.append("designation", finalDesignation);

    fd.append("portal", formData.portal);
    fd.append("portalDate", formData.portalDate);
    fd.append("experience", formData.experience);
    fd.append("relevantExp", formData.relevantExp);
    fd.append("recentCompany", formData.recentCompany);
    fd.append("applyDate", formData.applyDate);
    fd.append("callingDate", formData.callingDate);
    fd.append("currCTC", formData.currCTC);
    fd.append("expCTC", formData.expCTC);
    fd.append("feedback", formData.feedback);
    fd.append("remark", formData.remark);
    fd.append("jdBrief", formData.jdBrief);

    // Arrays must be JSON strings
    fd.append("topSkills", JSON.stringify(topSkills));
    fd.append("skillsAll", JSON.stringify(skillsAll));
    fd.append("companyNamesAll", JSON.stringify(companiesAll));
    fd.append("education", JSON.stringify(education));

    // Required by backend
    if (pdfFile) fd.append("pdfFile", pdfFile);

    dispatch(addCandidateManual(fd));
  };

  /* ------------------------------------------
     SUCCESS / ERROR HANDLING
  ------------------------------------------- */
  useEffect(() => {
    if (manualAddSuccess) {
      toast.success("Candidate added successfully");

      // Reset form
      setFormData({
        name: "",
        email: "",
        mobile: "",
        gender: "",
        location: "",
        qualification: "",
        portal: "",
        portalDate: "",
        experience: "",
        relevantExp: "",
        designation: "",
        customDesignation: "",
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
      setPdfFile(null);
      setErrors({});

      dispatch(resetManualAddState());
    }

    if (manualAddError) toast.error(manualAddError);
  }, [manualAddSuccess, manualAddError, dispatch]);

  if (!isAdmin)
    return (
      <div className="p-8 text-center text-red-600 text-xl">
        Admin access required
      </div>
    );

  /* ------------------------------------------
     Helpers for mobile input (only digits allowed)
  ------------------------------------------- */
  const handleMobileKeyDown = (e) => {
    // Allow control keys: backspace, delete, arrows, tab
    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
    ];
    if (allowedKeys.includes(e.key)) return;

    // Only digits allowed
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleMobilePaste = (e) => {
    const paste = (e.clipboardData || window.clipboardData).getData("text");
    if (!/^\d+$/.test(paste)) {
      e.preventDefault();
      return;
    }
    // if too long, trim after paste
    const current = (formData.mobile || "").toString();
    const combined = (current + paste).slice(0, 10);
    setFormData((prev) => ({ ...prev, mobile: combined }));
    e.preventDefault();
  };

  /* ------------------------------------------
     File input handler
  ------------------------------------------- */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file && file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }
    setPdfFile(file);
    setErrors((prev) => ({ ...prev, pdfFile: undefined }));
  };

  /* ------------------------------------------
     UI
  ------------------------------------------- */
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
            label="Full Name"
            required
            error={errors.name}
            value={formData.name}
            onChange={(v) => setFormData({ ...formData, name: v })}
          />

          <Input
            label="Email"
            required
            error={errors.email}
            value={formData.email}
            onChange={(v) => setFormData({ ...formData, email: v })}
          />

          <Input
            label="Mobile"
            required
            error={errors.mobile}
            value={formData.mobile}
            onChange={(v) =>
              // keep only digits and limit to 10 on manual input change
              setFormData((prev) => ({
                ...prev,
                mobile: v.replace(/\D/g, "").slice(0, 10),
              }))
            }
            onKeyDown={handleMobileKeyDown}
            onPaste={handleMobilePaste}
          />

          <Dropdown
            label="Gender"
            options={GENDER_OPTIONS}
            value={formData.gender}
            onChange={(v) => setFormData({ ...formData, gender: v })}
          />

          <CreatableDropdown
            label="Highest Qualification"
            required
            options={DEGREE_OPTIONS}
            value={formData.qualification}
            error={errors.qualification}
            onChange={(v) =>
              setFormData((prev) => ({
                ...prev,
                qualification: v,
              }))
            }
          />

          {/* DESIGNATION: Option B -> dropdown with "Other" handling */}
          <CreatableDropdown
            label="Designation"
            required
            options={DESIGNATION_OPTIONS}
            value={formData.designation}
            error={errors.designation}
            onChange={(v) =>
              setFormData((prev) => ({
                ...prev,
                designation: v,
              }))
            }
          />

          <CreatableDropdown
            label="Location"
            required
            options={LOCATION_OPTIONS} // USE THE IMPORTED DATA
            value={formData.location}
            error={errors.location}
            onChange={(v) =>
              setFormData((prev) => ({
                ...prev,
                location: v,
              }))
            }
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

          {/* PDF UPLOAD (with icon) */}
          <div>
            <label className="text-sm mb-1 block font-medium">
              Upload PDF Resume <span className="text-red-600">*</span>
            </label>

            {!pdfFile ? (
              <label
                htmlFor="pdf-upload"
                className={`w-full flex items-center gap-3 border rounded-md px-3 h-10 bg-[#FCFBF8] cursor-pointer ${
                  errors.pdfFile ? "border-red-500" : "border-gray-200"
                }`}
              >
                <FiUploadCloud className="text-2xl text-gray-500" />
                <span className="text-[#808080]">Attach PDF resume</span>
                <input
                  id="pdf-upload"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
              </label>
            ) : (
              <div className="flex items-center justify-between border rounded-md px-3 h-10 bg-[#FCFBF8]">
                <span className="text-[#808080] truncate">{pdfFile.name}</span>
                <div className="flex items-center gap-3">
                  <button
                    className="text-red-600"
                    onClick={() => setPdfFile(null)}
                    type="button"
                  >
                    <FiX size={18} />
                  </button>
                </div>
              </div>
            )}

            {errors.pdfFile && (
              <p className="text-red-600 text-xs mt-1">{errors.pdfFile}</p>
            )}
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
                type="button"
              >
                <FiTrash2 />
              </button>
            )}
          </div>
        ))}

        <button
          onClick={addEducation}
          type="button"
          className="text-blue-700 font-medium flex items-center gap-2 text-sm mb-6"
        >
          <FiPlus /> Add More Education
        </button>

        {/* TAG INPUTS */}
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
            required
            value={formData.remark}
            onChange={(v) => setFormData({ ...formData, remark: v })}
          />
        </div>

        <TextArea
          label="JD Brief"
          value={formData.jdBrief}
          onChange={(v) => setFormData({ ...formData, jdBrief: v })}
        />

        {/* SUBMIT BUTTON */}
        <button
          disabled={manualAddLoading}
          onClick={handleSubmit}
          className={`mt-10 px-6 py-2 bg-[#A1DB40] rounded-md ${
            manualAddLoading ? "opacity-60 cursor-not-allowed" : ""
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

function Input({
  label,
  value,
  onChange,
  error,
  type = "text",
  required = false,
  onKeyDown,
  onPaste,
}) {
  return (
    <div>
      <label className="text-sm mb-1 block font-medium">
        {label} {required && <span className="text-red-600">*</span>}
      </label>

      <input
        type={type}
        className={`w-full border rounded-md px-3 h-10 bg-[#FCFBF8] text-[#808080]
          ${error ? "border-red-500" : "border-gray-200"}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
      />
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}

function Dropdown({
  label,
  options,
  value,
  onChange,
  required = false,
  error,
}) {
  return (
    <div>
      <label className="text-sm font-medium mb-1 block">
        {label} {required && <span className="text-red-600">*</span>}
      </label>

      <div className="relative">
        <select
          className={`w-full border rounded-md px-3 pr-10 h-10 bg-[#FCFBF8] text-[#808080] appearance-none
            ${error ? "border-red-500" : "border-gray-200"}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
          <FaChevronDown />
        </span>
      </div>

      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <div className="mt-6">
      <label className="text-sm mb-1 block font-medium">{label}</label>
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
      <label className="text-sm block mb-2 font-medium">{label}</label>

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

function CreatableDropdown({
  label,
  options,
  value,
  onChange,
  required,
  error,
}) {
  const [inputValue, setInputValue] = useState(value || "");
  const [open, setOpen] = useState(false);

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(inputValue.toLowerCase())
  );

  const selectValue = (val) => {
    setInputValue(val);
    onChange(val);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim() !== "") {
        selectValue(inputValue.trim());
      }
    }
  };

  return (
    <div className="mb-4 relative">
      <label className="text-sm font-medium mb-1 block">
        {label} {required && <span className="text-red-600">*</span>}
      </label>

      <input
        type="text"
        value={inputValue}
        placeholder="Select or type"
        className={`w-full border rounded-md px-3 h-10 bg-[#FCFBF8] text-[#808080]
          ${error ? "border-red-500" : "border-gray-200"}`}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setInputValue(e.target.value);
          setOpen(true);
        }}
        onKeyDown={handleKeyDown}
      />

      {/* dropdown */}
      {open && (
        <div className="absolute z-20 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-sm">
          {filtered.length === 0 ? (
            <div
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onMouseDown={() => selectValue(inputValue)}
            >
              Create "{inputValue}"
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onMouseDown={() => selectValue(item)}
              >
                {item}
              </div>
            ))
          )}
        </div>
      )}

      {/* click outside to close */}
      {open && (
        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
      )}

      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}
