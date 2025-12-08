// scripts/runOnce.js
import fs from "fs";
import path from "path";
import bulkIndex from "./bulk-index.js";

const flagPath = path.resolve("scripts/indexed.flag");

const runOnce = async () => {
  if (fs.existsSync(flagPath)) {
    console.log("⛷️ Bulk index already executed, skipping. ");
    return;
  }

  console.log("Running bulk indexing...");
  await bulkIndex();
  fs.writeFileSync(flagPath, "done");

  console.log("✅Bulk indexing completed.");
};

export default runOnce;
