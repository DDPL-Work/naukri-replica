import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  uploadBulkFile,
  resetBulkState,
} from "../../features/slices/bulkSlice";
import {
  FiUploadCloud,
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";

// ============================================================
// REQUIRED COLUMNS + SYNONYMS
// ============================================================
const REQUIRED_COLUMNS = [
  {
    label: "Name",
    matches: ["Name", "Full Name", "Candidate Name"],
  },
  {
    label: "Email",
    matches: ["Email", "Email ID", "EmailId", "email", "email id", "email_id"],
  },
  {
    label: "Mobile",
    matches: [
      "Mobile",
      "Mobile No",
      "Mobile Number",
      "Contact",
      "Phone",
      "Phone Number",
    ],
  },
  {
    label: "Location",
    matches: ["Location", "City", "Current Location"],
  },
  {
    label: "Skills",
    matches: ["Skills", "Top Skills", "Skill", "Skillset", "Primary Skills"],
  },
  {
    label: "Resume URL",
    matches: [
      "Resume URL",
      "Resume URLs (Drive)",
      "Resume Link",
      "CV Link",
      "Resume",
      "ResumeUrl",
    ],
  },
];

const BulkUpload = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, success, error, result } = useSelector(
    (state) => state.bulk
  );

  const [file, setFile] = useState(null);
  const [requiredStatus, setRequiredStatus] = useState(null);
  const [extraColumns, setExtraColumns] = useState([]);

  // CLEAR FILE INPUTS AFTER SUCCESSFUL UPLOAD, KEEP SUMMARY
  useEffect(() => {
    if (success) {
      setFile(null);
      setRequiredStatus(null);
      setExtraColumns([]);
    }
  }, [success]);

  // ============================================================
  // PARSE EXCEL + MATCH COLUMNS
  // ============================================================
  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const ext = selected.name.split(".").pop().toLowerCase();
    const allowed = ["xlsx", "xls"];

    if (!allowed.includes(ext)) {
      toast.error("Only Excel files (.xlsx, .xls) allowed");
      return;
    }

    setFile(selected);
    dispatch(resetBulkState());
    setRequiredStatus(null);
    setExtraColumns([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (!json || json.length === 0) {
        toast.error("File is empty");
        return;
      }

      const headers = json[0].map((h) => String(h).trim());

      // Match required columns using synonyms
      const status = REQUIRED_COLUMNS.map((req) => {
        const exists = req.matches.some((m) =>
          headers.some((h) => h.toLowerCase() === m.toLowerCase())
        );
        return { column: req.label, exists };
      });

      setRequiredStatus(status);

      // Detect extra columns
      const allSynonyms = REQUIRED_COLUMNS.flatMap((r) =>
        r.matches.map((m) => m.toLowerCase())
      );

      const extras = headers.filter(
        (h) => !allSynonyms.includes(h.toLowerCase())
      );

      setExtraColumns(extras);
    };

    reader.readAsArrayBuffer(selected);
  };

  // ============================================================
  // UPLOAD FILE
  // ============================================================
  const handleUpload = () => {
    if (!file) return toast.error("Please select a file");

    const allValid = requiredStatus?.every((c) => c.exists);
    if (!allValid)
      return toast.error("Fix required field mismatches before uploading");

    dispatch(uploadBulkFile(file));
  };

  const allRequirementsMet =
    requiredStatus && requiredStatus.every((item) => item.exists);

  return (
    <div className="w-full min-h-screen bg-white p-10">
      {/* PAGE TITLE */}
      <div className="mb-6">
        <h1 className="text-black text-4xl font-bold font-serif leading-[60px]">
          Bulk Upload Candidates
        </h1>
        <p className="text-zinc-500 text-xl font-normal leading-6 font-[Calibri]">
          Upload multiple candidates from Excel files
        </p>
      </div>

      {/* UPLOAD BOX */}
      <div className="w-full max-w-[860px] bg-white rounded-[19px] border-2 border-dashed border-zinc-300 p-14 mb-10">
        <div className="w-full flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-blue-900/10 rounded-full flex items-center justify-center">
            <FiUploadCloud className="text-blue-900" size={28} />
          </div>

          <h2 className="text-blue-900 text-xl font-bold font-serif text-center">
            Drag & drop your file here
          </h2>

          <p className="text-zinc-500 text-base font-normal font-[Calibri] text-center">
            or click the button below to browse
          </p>

          {/* FILE SELECT BUTTON */}
          <div className="w-full flex justify-center mt-6">
            <div className="flex flex-col items-center gap-4  p-6  w-[350px]">
              {/* Upload Button */}
              {!allRequirementsMet && (
                <label className="w-full px-4 py-3 bg-lime-400 rounded-md flex justify-center items-center gap-2 cursor-pointer hover:bg-lime-500 transition">
                  <span className="text-black text-base font-[Calibri]">
                    Upload File
                  </span>
                  <FiFileText className="text-black" size={18} />
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onClick={(e) => (e.target.value = null)}
                    onChange={handleFileSelect}
                  />
                </label>
              )}

              {/* Divider */}
              <div className="flex w-full items-center gap-3 ">
                <div className="flex-1 h-px bg-zinc-300"></div>
                <span className="text-zinc-500 text-sm font-[Calibri]">or</span>
                <div className="flex-1 h-px bg-zinc-300"></div>
              </div>

              {/* Manual Add Button */}
              <div
                onClick={() => navigate("/admin/add-candidate")}
                className="w-full px-4 py-3 bg-lime-400 rounded-md flex justify-center items-center gap-2 cursor-pointer hover:bg-lime-500 transition"
              >
                <span className="text-black text-base font-[Calibri]">
                  Add Candidate Manually
                </span>
              </div>
            </div>
          </div>

          {/* SELECTED FILE NAME */}
          {file && (
            <div className="flex items-center gap-3 mt-3">
              <p className="text-blue-900 text-sm font-[Calibri]">
                Selected File: <strong>{file.name}</strong>
              </p>

              <button
                onClick={() => {
                  setFile(null);
                  setRequiredStatus(null);
                  setExtraColumns([]);
                  dispatch(resetBulkState());
                }}
                className="text-red-600 hover:text-red-800 text-sm font-[Calibri]"
              >
                Remove
              </button>
            </div>
          )}

          {/* UPLOAD BUTTON (only when valid) */}
          {allRequirementsMet && (
            <button
              onClick={handleUpload}
              disabled={loading}
              className="mt-6 px-6 py-2 bg-blue-900 text-white rounded-md font-[Calibri]
          text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Uploading..." : "Start Upload"}
            </button>
          )}
        </div>
      </div>

      {/* FILE REQUIREMENTS SECTION (MATCHING LOGIC INSIDE HERE) */}
      <div className="w-full max-w-[860px] bg-[#E8EDF5] rounded-[19px] p-6 mt-10">
        <div className="flex items-center gap-2 mb-4">
          <FiFileText className="text-black" size={20} />
          <h3 className="text-black text-lg font-bold font-[Calibri] leading-7">
            File Requirements
          </h3>
        </div>

        <ul className="text-blue-900 text-xs font-normal font-[Calibri] leading-6 space-y-2 pl-3">
          {/* Static bullets for description */}
          <li className="list-disc">Supported formats: .xlsx, .xls</li>

          <li className="list-disc">Maximum file size: 10MB</li>

          <li className="list-disc">
            Required columns: Name, Email, Mobile, Location, Skills, Resume URL
          </li>

          <li className="list-disc">
            Unique ID field must be unique across all candidates
          </li>

          <li className="list-disc mb-4">
            Email and mobile numbers are validated for format
          </li>

          {/* DYNAMIC VALIDATION TITLE */}
          {requiredStatus && (
            <li className="text-black text-sm font-bold font-[Calibri] mt-4 mb-1">
              Column Match Status:
            </li>
          )}

          {/* REQUIRED FIELD VALIDATION WITH ICONS */}
          {requiredStatus &&
            REQUIRED_COLUMNS.map((req, idx) => {
              const match =
                requiredStatus?.find((x) => x.column === req.label)?.exists ??
                null;

              return (
                <li
                  key={idx}
                  className="flex items-center justify-between text-blue-900 pr-2"
                >
                  <span className="text-xs font-[Calibri]">{req.label}</span>

                  {match === true && (
                    <FiCheckCircle size={18} className="text-green-600" />
                  )}
                  {match === false && (
                    <FiXCircle size={18} className="text-red-600" />
                  )}
                </li>
              );
            })}

          {/* EXTRA COLUMNS */}
          {extraColumns.length > 0 && (
            <>
              <li className="text-black text-sm font-bold font-[Calibri] mt-3 mb-1">
                Additional Columns Detected:
              </li>

              {extraColumns.map((col, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between text-blue-900 pr-2 pl-3"
                >
                  <span className="text-xs font-[Calibri]">{col}</span>
                  <FiAlertCircle size={18} className="text-yellow-500" />
                </li>
              ))}
            </>
          )}
        </ul>
      </div>

      {/* SUCCESS */}
      {success && result && (
        <div className="w-full max-w-[860px] bg-green-100 border border-green-300 rounded-lg p-6 mt-6">
          <h3 className="text-green-900 text-lg font-bold font-[Calibri] leading-7 mb-2">
            Upload Summary
          </h3>
          <ul className="text-green-900 text-sm font-[Calibri] leading-6">
            <li>Total Rows: {result.total}</li>
            <li>Success: {result.success}</li>
            <li>Failed: {result.failed}</li>
          </ul>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="w-full max-w-[860px] bg-red-100 border border-red-300 rounded-lg p-6 mt-6">
          <h3 className="text-red-900 text-lg font-bold font-[Calibri] leading-7">
            Upload Failed
          </h3>
          <p className="text-red-700 text-sm font-[Calibri] mt-1">{error}</p>
        </div>
      )}
    </div>
  );
};

export default BulkUpload;
