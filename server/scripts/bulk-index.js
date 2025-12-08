// scripts/bulk-index.js
import mongoose from "mongoose";
import Candidate from "../models/candidate.model.js";
import { indexCandidate, ensureIndex } from "../services/elasticsearch.service.js";

const bulkIndex = async () => {
  console.log("Starting bulk indexing...");

  await ensureIndex();

  const candidates = await Candidate.find({});
  console.log("Total candidates:", candidates.length);

  for (const c of candidates) {
    await indexCandidate(c);
    console.log("Indexed:", c._id.toString());
  }

  console.log("Bulk indexing DONE");
};

export default bulkIndex;
