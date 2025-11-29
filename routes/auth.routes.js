import express from "express";
import {
  loginController,
  registerInitialAdmin,
  registerRecruiter,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Initial admin registration (only if DB has no admin)
router.post("/register-admin", registerInitialAdmin);

// Login
router.post("/login", loginController);

// Admin creating new recruiter (protected route)
router.post("/register-recruiter", authMiddleware(["ADMIN"]), registerRecruiter);

export default router;
