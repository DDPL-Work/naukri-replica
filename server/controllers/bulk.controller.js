// controllers/bulk.controller.js
import multer from "multer";
import { parseCSVBuffer, parseXLSXBuffer } from "../utils/csvParser.js";
import Candidate from "../models/candidate.model.js";
import BulkUploadLog from "../models/bulkUploadLog.model.js";
import ActivityLog from "../models/activityLog.model.js";
import { upsertCandidate } from "../services/candidate.service.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

export const uploadMiddleware = upload.single("file");

// Helper to safely parse numbers
const safeNumber = (val) => {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
};

/**
 * Bulk upload handler
 */
export const bulkUploadHandler = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const buffer = req.file.buffer;
    const filename = req.file.originalname.toLowerCase();

    let rows = [];
    if (filename.endsWith(".csv")) rows = parseCSVBuffer(buffer);
    else rows = parseXLSXBuffer(buffer);

    const total = rows.length;
    let success = 0;
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        // Map Excel/CSV headers to DB fields
        const candidateData = {
          unique_id: row["Unique ID"] || row["unique_id"],
          fullName: row["Name"] || row["fullName"],
          resumeUrl: row["Resume URLs (Drive)"] || row["resumeUrl"],
          email: row["Email ID"] || row["email"],
          phone: row["Mobile No"] || row["phone"],
          location: row["Location"] || row["location"],
          designation: row["Designation"] || row["designation"],
          topSkills: row["Top Skills"] ? row["Top Skills"].split(",").map(s => s.trim()) : [],
          recentCompany: row["Recent Company"] || "",
          skills: row["Skills (All)"] ? row["Skills (All)"].split(",").map(s => s.trim()) : [],
          companyNamesAll: row["Company Names (All)"] ? row["Company Names (All)"].split(",").map(s => s.trim()) : [],
          portal: row["Portal"] || "",
          portalDate: row["Portal Date"] ? new Date(row["Portal Date"]) : null,
          applyDate: row["Apply Date"] ? new Date(row["Apply Date"]) : null,
          experience: safeNumber(row["Experience"]),
          ctcCurrent: safeNumber(row["Curr CTC"]),
          ctcExpected: safeNumber(row["Exp CTC"]),
          feedback: row["Feedback"] || "",
          remark: row["Remark"] || "",
        };

        // Validate required fields
        const required = ["unique_id", "fullName", "resumeUrl"];
        for (const f of required) {
          if (!candidateData[f]) throw new Error(`Row ${i + 1} missing ${f}`);
        }

        await upsertCandidate(candidateData);
        success++;
      } catch (err) {
        errors.push({ row: i + 1, error: err.message });
      }
    }

    const log = await BulkUploadLog.create({
      uploadedBy: req.user._id,
      fileName: filename,
      totalRows: total,
      successRows: success,
      failedRows: total - success,
      errors,
    });

    await ActivityLog.create({
      userId: req.user._id,
      type: "ADD_CANDIDATE",
      payload: { bulkUploadId: log._id },
    });

    res.json({ total, success, failed: total - success, errors });
  } catch (err) {
    next(err);
  }
};