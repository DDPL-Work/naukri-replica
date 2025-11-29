// controllers/candidate.controller.js
import Candidate from "../models/candidate.model.js";
import ActivityLog from "../models/activityLog.model.js";
import { upsertCandidate } from "../services/candidate.service.js";
import { searchCandidatesES } from "../services/elasticsearch.service.js";
import { canDownloadResume, logDownload } from "../services/download.service.js";

/**
 * Manual add/upsert candidate
 */
export const addOrUpdateCandidate = async (req, res, next) => {
  try {
    const required = ["unique_id", "fullName", "resumeUrl"];
    for (const f of required) {
      if (!req.body[f]) return res.status(400).json({ error: `${f} is required` });
    }

    const candidate = await upsertCandidate(req.body);
    await ActivityLog.create({ userId: req.user._id, type: "ADD_CANDIDATE", payload: { candidateId: candidate._id } });
    res.json({ success: true, candidate });
  } catch (err) {
    next(err);
  }
};

/**
 * Get candidate by id
 */
export const getCandidate = async (req, res, next) => {
  try {
    const id = req.params.id;
    const candidate = await Candidate.findById(id);
    if (!candidate) return res.status(404).json({ error: "Not found" });

    // Enforce daily resume view limit for recruiters
    if (req.user.role === "RECRUITER") {
      const allowed = await canDownloadResume(req.user._id);
      if (!allowed) return res.status(403).json({ error: "Daily resume view limit reached" });
      await logDownload(req.user._id, candidate._id);
    }

    await ActivityLog.create({ userId: req.user._id, type: "VIEW_PROFILE", payload: { candidateId: id } });
    res.json(candidate);
  } catch (err) {
    next(err);
  }
};

/**
 * Search via ES with recruiter limit enforcement
 */
export const searchCandidates = async (req, res, next) => {
  try {
    const q = req.query.q || "";
    const page = Math.max(0, parseInt(req.query.page || "1", 10));
    const size = Math.min(100, parseInt(req.query.size || "20", 10));
    const from = (page - 1) * size;

    const esQuery = {
      from,
      size,
      query: {
        bool: {
          must: q
            ? [
                {
                  multi_match: {
                    query: q,
                    type: "best_fields",
                    fields: ["fullName^3", "designation^2", "topSkills", "skills", "recentCompany", "companyNamesAll", "location"],
                    fuzziness: "AUTO",
                  },
                },
              ]
            : [{ match_all: {} }],
          filter: [],
        },
      },
    };

    // Add filters
    if (req.query.location) esQuery.query.bool.filter.push({ term: { location: req.query.location } });
    if (req.query.minExp) esQuery.query.bool.filter.push({ range: { experience: { gte: Number(req.query.minExp) } } });
    if (req.query.maxExp) esQuery.query.bool.filter.push({ range: { experience: { lte: Number(req.query.maxExp) } } });

    const hits = await searchCandidatesES(esQuery);

    const results = [];
    for (const h of hits.hits) {
      // Enforce daily limit for recruiters
      if (req.user.role === "RECRUITER") {
        const allowed = await canDownloadResume(req.user._id);
        if (!allowed) break; // Stop adding more candidates if limit reached
        await logDownload(req.user._id, h._id);
      }

      results.push({ id: h._id, score: h._score, source: h._source });
    }

    await ActivityLog.create({ userId: req.user._id, type: "SEARCH", payload: { query: q } });
    res.json({ total: hits.total.value || hits.total, results });
  } catch (err) {
    next(err);
  }
};

/**
 * Update feedback/remark for a candidate
 */
export const updateFeedback = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { feedback, remark } = req.body;
    const updated = await Candidate.findByIdAndUpdate(
      id,
      { $set: { feedback, remark, updatedAt: new Date() } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Candidate not found" });
    res.json({ success: true, candidate: updated });
  } catch (err) {
    next(err);
  }
};