import Candidate from "../models/candidate.model.js";
import ActivityLog from "../models/activityLog.model.js";
import { upsertCandidate } from "../services/candidate.service.js";
import { searchCandidatesES } from "../services/elasticsearch.service.js";
import logger from "../config/logger.js";
import { canDownloadResume, logDownload } from "../services/download.service.js";
import { indexCandidate } from "../services/elasticsearch.service.js";

/* -------------------------------------------------------
   ADD / UPDATE CANDIDATE (MANUAL ENTRY)
------------------------------------------------------- */
export const addOrUpdateCandidate = async (req, res, next) => {
  try {
    const required = ["unique_id", "fullName", "resumeUrl"];
    for (const f of required) {
      if (!req.body[f]) {
        return res.status(400).json({ error: `${f} is required` });
      }
    }

    const candidate = await upsertCandidate(req.body);

    // index into ES
    await indexCandidate(candidate);

    await ActivityLog.create({
      userId: req.user._id,
      type: "ADD_CANDIDATE",
      payload: { candidateId: candidate._id }
    });

    res.json({ success: true, candidate });
  } catch (err) {
    logger.error("addOrUpdateCandidate error:", err);
    next(err);
  }
};

/* -------------------------------------------------------
   GET ONE CANDIDATE
------------------------------------------------------- */
export const getCandidate = async (req, res, next) => {
  try {
    const id = req.params.id;
    const c = await Candidate.findById(id);

    if (!c) return res.status(404).json({ error: "Not found" });

    res.json(c);
  } catch (err) {
    logger.error("getCandidate error:", err);
    next(err);
  }
};

/* -------------------------------------------------------
   SEARCH CANDIDATES (ES)
------------------------------------------------------- */
export const searchCandidates = async (req, res, next) => {
  try {
    const q = req.query.q || "";
    const page = Math.max(1, parseInt(req.query.page || "1"));
    const size = Math.min(100, parseInt(req.query.size || "20"));
    const from = (page - 1) * size;

    const esQuery = {
      from,
      size,
      query: {
        bool: {
          must: q
            ? [{
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
              }]
            : [{ match_all: {} }],
          filter: []
        }
      }
    };

    if (req.query.location) {
      esQuery.query.bool.filter.push({ term: { location: req.query.location } });
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

    if (req.query.designation) {
      esQuery.query.bool.filter.push({
        match: { designation: req.query.designation }
      });
    }

    if (req.query.skills) {
      const skillsArr = Array.isArray(req.query.skills)
        ? req.query.skills
        : req.query.skills.split(",").map((s) => s.trim());

      esQuery.query.bool.filter.push({
        terms: { skills: skillsArr }
      });
    }

    // Perform ES search
    const esResult = await searchCandidatesES(esQuery);

    const total = esResult.total?.value || esResult.total || 0;
    const hits = Array.isArray(esResult.hits)
      ? esResult.hits
      : esResult.hits?.hits || [];

    const results = hits.map((hit) => ({
      id: hit._id,
      score: hit._score,
      source: hit._source
    }));

    // Log search
    await ActivityLog.create({
      userId: req.user._id,
      type: "search_candidates",
      payload: { query: req.query }
    });

    res.json({ total, results });
  } catch (err) {
    logger.error("searchCandidates error:", err);
    next(err);
  }
};

/* -------------------------------------------------------
   UPDATE FEEDBACK
------------------------------------------------------- */
export const updateFeedback = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { feedback, remark } = req.body;

    const updated = await Candidate.findByIdAndUpdate(
      id,
      { $set: { feedback, remark, updatedAt: new Date() } },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ error: "Candidate not found" });

    res.json({ success: true, candidate: updated });
  } catch (err) {
    logger.error("updateFeedback error:", err);
    next(err);
  }
};

/* -------------------------------------------------------
   RESUME VIEW WITH DAILY LIMITS
------------------------------------------------------- */
export const viewResume = async (req, res, next) => {
  try {
    const id = req.params.id;
    const c = await Candidate.findById(id);

    const resumeUrl = c?.pdfFile || c?.resumeUrl;
    if (!c || !resumeUrl)
      return res.status(404).json({ error: "Resume not found" });

    // Only recruiters have limits
    if (req.user.role === "RECRUITER") {
      const allowed = await canDownloadResume(req.user._id);

      if (!allowed)
        return res.status(403).json({
          error: "Daily resume view limit reached"
        });

      await logDownload(req.user._id, c._id);
    }

    res.json({ url: resumeUrl });
  } catch (err) {
    logger.error("viewResume error:", err);
    next(err);
  }
};
