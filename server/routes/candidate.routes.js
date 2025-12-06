// routes/candidate.routes.js
import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  addOrUpdateCandidate,
  getCandidate,
  searchCandidates,
  updateFeedback,
  viewResume,         // <-- ADD THIS
} from "../controllers/candidates.controller.js";

import { logAction } from "../middlewares/logRecruiterMiddleware.js";

const router = express.Router();

// Create / update candidate
router.post("/", authMiddleware(["RECRUITER", "ADMIN"]), addOrUpdateCandidate);

// Search candidates
router.get(
  "/search",
  authMiddleware(["RECRUITER", "ADMIN"]),
  logAction("search_candidates"),
  searchCandidates
);

// Candidate Profile (NO LIMIT)
router.get(
  "/:id",
  authMiddleware(["RECRUITER", "ADMIN"]),
  logAction("view_candidate"),
  getCandidate
);

// Update feedback
router.patch(
  "/:id/feedback",
  authMiddleware(["RECRUITER", "ADMIN"]),
  logAction("update_remark"),
  updateFeedback
);

// NEW: View Resume (DAILY LIMIT APPLIES HERE)
router.get(
  "/:id/resume",
  authMiddleware(["RECRUITER", "ADMIN"]),
  logAction("view_resume"),
  viewResume
);

export default router;
