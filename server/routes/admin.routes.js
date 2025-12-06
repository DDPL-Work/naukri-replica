// routes/admin.routes.js
import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  listRecruiters,
  updateRecruiter,
  downloadsSummary,
  analytics,
} from "../controllers/admin.controller.js";
import { addCandidateManual } from "../controllers/candidateManual.controller.js";
import { uploadPDF } from "../middlewares/uploadPdf.js";

const router = express.Router();

router.get("/recruiters", authMiddleware(["ADMIN"]), listRecruiters);
router.patch("/recruiters/:id", authMiddleware(["ADMIN"]), updateRecruiter);
router.get("/downloads/summary", authMiddleware(["ADMIN"]), downloadsSummary);
router.get("/analytics", authMiddleware(["ADMIN"]), analytics);
router.post("/add-manual", authMiddleware(["ADMIN"]), uploadPDF, addCandidateManual);

export default router;
