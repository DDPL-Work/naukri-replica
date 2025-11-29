// backend/app.js

import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { limiter } from "./middlewares/rateLimiter.js";
import logger from "./config/logger.js";
import authRoutes from "./routes/auth.routes.js";
import candidateRoutes from "./routes/candidate.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import downloadRoutes from "./routes/download.routes.js";
import bulkRoutes from "./routes/bulk.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors({ origin: process.env.FRONTEND_URL || "*", credentials: true }));

// JSON + URL-encoded body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan("combined", { stream: logger.stream }));

// Global rate limiter
app.use(limiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/downloads", downloadRoutes);
app.use("/api/bulk", bulkRoutes);

// Health check
app.get("/api/health", (req, res) => res.json({ status: "OK" }));

// Global error handler
app.use(errorMiddleware);

export default app;