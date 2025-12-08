import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import { testESConnection, ensureIndex } from "./services/elasticsearch.service.js";
import runOnce from "./scripts/runOnce.js";


dotenv.config();
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // 1. Connect MongoDB
    await connectDB();
    console.log(`\n✅Database is connected successfully`);
    console.log(`✅Server running on port ${PORT}`);

    // 2. Test Elasticsearch
    await testESConnection();

    // 3. Ensure ES index exists
    await ensureIndex();

    // 4. Run bulk-index ONCE
    await runOnce();

    // 5. Start Server
    app.listen(PORT, () => {
      console.log(`\n✅Database is connected successfully`);
      console.log(`✅Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Startup Error:", err);
    process.exit(1);
  }
};

startServer();
