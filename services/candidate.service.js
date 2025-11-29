// services/candidate.service.js
import Candidate from "../models/candidate.model.js";
import { indexCandidate } from "./elasticsearch.service.js";

export const upsertCandidate = async (data) => {
  const filter = { unique_id: data.unique_id };
  const update = { $set: { ...data, updatedAt: new Date() } };
  const options = { new: true, upsert: true };
  const candidate = await Candidate.findOneAndUpdate(filter, update, options);
  // index to ES (async)
  indexCandidate(candidate).catch(() => {});
  return candidate;
};

export const getCandidateById = async (id) => {
  return Candidate.findById(id);
};
