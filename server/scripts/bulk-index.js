// scripts/bulk-index.js
import Candidate from "../models/candidate.model.js";
import { indexCandidate, ensureIndex } from "../services/elasticsearch.service.js";

const BULK_SIZE = 500;

const bulkIndex = async () => {
  console.log("\n🚀 Starting bulk indexing...");

  await ensureIndex();

  const total = await Candidate.countDocuments();
  console.log("📌 Total candidates found:", total);

  let processed = 0;

  while (processed < total) {
    const batch = await Candidate.find({})
      .skip(processed)
      .limit(BULK_SIZE);

    console.log(`📦 Indexing batch: ${processed} → ${processed + batch.length}`);

    for (const c of batch) {
      try {
        await indexCandidate(c);
      } catch (err) {
        console.error("❌ Failed to index:", c._id, err.message);
      }
    }

    processed += batch.length;
  }

  console.log("\n✅ Bulk indexing complete!");
};

export default bulkIndex;
