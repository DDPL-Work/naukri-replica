import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
  unique_id: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  designation: { type: String },
  experience: { type: Number },
  ctcCurrent: { type: Number },
  ctcExpected: { type: Number },
  skills: [String],
  topSkills: [String],
  recentCompany: String,
  companyNamesAll: [String],
  location: String,
  portal: String,
  portalDate: Date,
  applyDate: Date,
  resumeUrl: { type: String, required: true },
  feedback: String,
  remark: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Candidate", candidateSchema);