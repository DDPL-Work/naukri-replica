// routes/candidate.routes.js
import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { addOrUpdateCandidate, getCandidate, searchCandidates, updateFeedback } from "../controllers/candidates.controller.js";

const router = express.Router();

// protected - recruiters & admin
router.post("/", authMiddleware(["RECRUITER", "ADMIN"]), addOrUpdateCandidate);
router.get("/search", authMiddleware(["RECRUITER","ADMIN"]), searchCandidates);
router.get("/:id", authMiddleware(["RECRUITER","ADMIN"]), getCandidate);
router.patch("/:id/feedback", authMiddleware(["RECRUITER","ADMIN"]), updateFeedback);

export default router;
