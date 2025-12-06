// server/middlewares/uploadPdf.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import "../config/cloudinary.js";  

// storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "candidate_resumes",
    resource_type: "raw",
    allowed_formats: ["pdf"],
    public_id: () => `candidate_${Date.now()}`,
    type:"upload",
    flags: ["attachment:false"],
  },
});

// Allow only PDF files
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "application/pdf" ||
    file.originalname.toLowerCase().endsWith(".pdf")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"));
  }
};

// Multer uploader
const uploader = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const uploadPDF = uploader.single("pdfFile");
