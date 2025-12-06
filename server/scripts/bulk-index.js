import mongoose from "mongoose";
import dotenv from "dotenv";
import Candidate from "../models/candidate.model.js";
import { indexCandidate, ensureIndex } from "../services/elasticsearch.service.js";

dotenv.config();

const start = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  await ensureIndex();

  const candidates = await Candidate.find({});
  console.log("Total candidates:", candidates.length);

  for (const c of candidates) {
    await indexCandidate(c);
    console.log("Indexed:", c._id.toString());
  }

  console.log("DONE");
  process.exit(0);
};

start();
