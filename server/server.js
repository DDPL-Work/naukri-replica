import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";
import logger from "./config/logger.js";

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      // logger.info(`✅Server running on port ${PORT}`);
      console.log(`\n✅Database is connected successfully`);
      console.log(`✅Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error("Failed to connect to MongoDB", err);
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });