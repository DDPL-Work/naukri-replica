// models/activityLog.model.js
import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: { type: String, enum: ["LOGIN", "SEARCH", "VIEW_PROFILE", "DOWNLOAD", "ADD_CANDIDATE", "CREATE_RECRUITER"], required: true },
  payload: { type: Object },
  createdAt: { type: Date, default: Date.now },
});

activityLogSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("ActivityLog", activityLogSchema);
