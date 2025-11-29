// routes/download.routes.js
import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { downloadResume } from "../controllers/download.controller.js";

const router = express.Router();

router.post("/:id", authMiddleware(["RECRUITER","ADMIN"]), downloadResume);

export default router;
