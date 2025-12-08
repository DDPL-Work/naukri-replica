// scripts/runOnce.js
import fs from "fs";
import path from "path";
import bulkIndex from "./bulk-index.js";

const flagPath = path.join(process.cwd(), "scripts", "indexed.flag");

const runOnce = async () => {
  if (fs.existsSync(flagPath)) {
    console.log("⛷️  Bulk index already executed → skipping.");
    return;
  }

  console.log("🚀 Running bulk indexing for FIRST TIME...");
  
  await bulkIndex();

  // Write flag so next restart does NOT re-index
  fs.writeFileSync(flagPath, "done");

  console.log("✅ Bulk indexing finished and flag saved.");
};

export default runOnce;
