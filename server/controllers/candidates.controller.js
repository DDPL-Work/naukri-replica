import Candidate from "../models/candidate.model.js";
import ActivityLog from "../models/activityLog.model.js";
import { upsertCandidate } from "../services/candidate.service.js";
import { searchCandidatesES } from "../services/elasticsearch.service.js";
import { canDownloadResume, logDownload } from "../services/download.service.js";
import logger from "../config/logger.js";

/**
 * Manual add/upsert candidate
 */
export const addOrUpdateCandidate = async (req, res, next) => {
  try {
    const required = ["unique_id", "fullName", "resumeUrl"];
    for (const f of required) {
      if (!req.body[f]) {
        return res.status(400).json({ error: `${f} is required` });
      }
    }

    const candidate = await upsertCandidate(req.body);

    await ActivityLog.create({
      userId: req.user._id,
      type: "ADD_CANDIDATE",
      payload: { candidateId: candidate._id }
    });

    res.json({ success: true, candidate });
  } catch (err) {
    next(err);
  }
};

/**
 * Get candidate by ID (NO daily limit)
 */
export const getCandidate = async (req, res, next) => {
  try {
    const id = req.params.id;
    const candidate = await Candidate.findById(id);

    if (!candidate) {
      return res.status(404).json({ error: "Not found" });
    }

    await ActivityLog.create({
      userId: req.user._id,
      type: "VIEW_PROFILE",
      payload: { candidateId: id }
    });

    res.json(candidate);
  } catch (err) {
    logger.error("getCandidate error:", err);
    next(err);
  }
};

/**
 * Search candidates (NO daily limit)
 */
export const searchCandidates = async (req, res, next) => {
  try {
    const q = req.query.q || "";
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
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
                    fields: [
                      "fullName^3",
                      "designation^2",
                      "topSkills",
                      "skills",
                      "recentCompany",
                      "companyNamesAll",
                      "location"
                    ],
                    fuzziness: "AUTO"
                  }
                }
              ]
            : [{ match_all: {} }],
          filter: []
        }
      }
    };

    if (req.query.location) {
      esQuery.query.bool.filter.push({
        match: { location: req.query.location }
      });
    }

    if (req.query.minExp) {
      esQuery.query.bool.filter.push({
        range: { experience: { gte: Number(req.query.minExp) } }
      });
    }

    if (req.query.maxExp) {
      esQuery.query.bool.filter.push({
        range: { experience: { lte: Number(req.query.maxExp) } }
      });
    }

    let esResult;
    try {
      esResult = await searchCandidatesES(esQuery);
    } catch (error) {
      logger.error("ELASTICSEARCH ERROR:", error);
      return res.status(500).json({
        error: "ElasticSearch failure",
        details: error?.message || ""
      });
    }

    const total =
      (esResult.total && (esResult.total.value ?? esResult.total)) || 0;

    const hits = Array.isArray(esResult.hits)
      ? esResult.hits
      : esResult.hits?.hits || [];

    const results = hits.map((item) => ({
      id: item._id,
      score: item._score,
      source: item._source
    }));

    await ActivityLog.create({
      userId: req.user._id,
      type: "SEARCH",
      payload: { query: q }
    });

    return res.json({ total, results });
  } catch (err) {
    logger.error("searchCandidates error:", err);
    next(err);
  }
};

/**
 * Update candidate feedback
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

    if (!updated) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    res.json({ success: true, candidate: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * NEW — View resume (ENFORCES DAILY LIMIT)
 */
export const viewResume = async (req, res, next) => {
  try {
    const id = req.params.id;
    const candidate = await Candidate.findById(id);

    const resumeUrl = candidate?.pdfFile || candidate?.resumeUrl;

    if (!candidate || !resumeUrl) {
      return res.status(404).json({ error: "Resume not found" });
    }

    // Recruiters have limits, Admins do not
    if (req.user.role === "RECRUITER") {
      const allowed = await canDownloadResume(req.user._id);
      if (!allowed) {
        return res.status(403).json({
          error: "Daily resume view limit reached",
        });
      }

      await logDownload(req.user._id, candidate._id);
    }

    res.json({ url: resumeUrl });

  } catch (err) {
    next(err);
  }
};

