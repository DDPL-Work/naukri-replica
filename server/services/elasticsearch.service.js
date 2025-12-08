// services/elasticsearch.service.js
import { Client } from "@elastic/elasticsearch";
import config from "../config/index.js";
import logger from "../config/logger.js";

/* -------------------------------------------------------
   LOG WRAPPER (simple + safe)
------------------------------------------------------- */
const log = {
  info: (...a) => console.log("[ES INFO]", ...a),
  error: (...a) => console.error("[ES ERROR]", ...a),
};

/* -------------------------------------------------------
   CLIENT INITIALIZATION
------------------------------------------------------- */
const client = new Client({
  node: config.esNode,
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || "elastic",
    password: process.env.ELASTICSEARCH_PASSWORD || "",
  },
  tls: { rejectUnauthorized: false },
});

export const ES_INDEX = process.env.ES_INDEX || "candidates";

/* -------------------------------------------------------
   1. ENSURE INDEX EXISTS WITH CORRECT MAPPINGS
------------------------------------------------------- */
export const ensureIndex = async () => {
  try {
    const exists = await client.indices.exists({ index: ES_INDEX });

    if (!exists) {
      await client.indices.create({
        index: ES_INDEX,
        body: {
          mappings: {
            properties: {
              candidateId: { type: "keyword" },

              fullName: { type: "text" },
              designation: { type: "text" },

              topSkills: { type: "keyword" },
              skills: { type: "keyword" },
              companyNamesAll: { type: "keyword" },

              recentCompany: { type: "text" },

              location: { type: "keyword" },

              experience: { type: "float" },
              ctcCurrent: { type: "float" },
              ctcExpected: { type: "float" },

              portal: { type: "keyword" },
              portalDate: { type: "date" },
              applyDate: { type: "date" },
            },
          },
        },
      });

      log.info(`Index created: ${ES_INDEX}`);
    }
  } catch (err) {
    log.error("ensureIndex error:", err?.message || err);
  }
};

/* -------------------------------------------------------
   2. HELPER: CLEAN EXPERIENCE FIELD
------------------------------------------------------- */
const parseExperience = (val) => {
  if (!val) return null;

  if (typeof val === "string") {
    const cleaned = val.replace(/[^0-9.-]/g, "").trim(); // remove 'years'
    if (cleaned.includes("-")) {
      const [low] = cleaned.split("-");
      return parseFloat(low) || null;
    }
    return parseFloat(cleaned) || null;
  }

  if (typeof val === "number") return val;

  return null;
};

/* -------------------------------------------------------
   SAFE ARRAY HELPER
------------------------------------------------------- */
const toArray = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String);
  return [String(v)];
};

/* -------------------------------------------------------
   3. UPSERT CANDIDATE INTO ELASTICSEARCH
------------------------------------------------------- */
export const indexCandidate = async (candidate) => {
  try {
    const id = candidate._id.toString();

    const body = {
      candidateId: id,

      fullName: candidate.fullName || candidate.name || "",
      designation: candidate.designation || "",

      topSkills: toArray(candidate.topSkills),
      skills: toArray(candidate.skillsAll),

      recentCompany: candidate.recentCompany || "",
      companyNamesAll: toArray(candidate.companyNamesAll),

      location: candidate.location || "",

      experience: parseExperience(candidate.experience),

      ctcCurrent: Number(candidate.currCTC || 0),
      ctcExpected: Number(candidate.expCTC || 0),

      portal: candidate.portal || "",
      portalDate: candidate.portalDate || null,
      applyDate: candidate.applyDate || null,
    };

    await client.index({
      index: ES_INDEX,
      id,
      refresh: true,        // ensure search sees it immediately
      body,
    });

    log.info("Indexed candidate:", id);
  } catch (err) {
    log.error("indexCandidate error:", err?.message || err);
  }
};

/* -------------------------------------------------------
   4. SEARCH WRAPPER
------------------------------------------------------- */
export const searchCandidatesES = async (rawQuery) => {
  try {
    const result = await client.search({
      index: ES_INDEX,
      body: rawQuery,
    });

    return result.hits;
  } catch (err) {
    log.error("searchCandidatesES error:", err?.message || err);
    throw err;
  }
};

/* -------------------------------------------------------
   5. TEST CONNECTION
------------------------------------------------------- */
export const testESConnection = async () => {
  try {
    const info = await client.info();
    log.info("Connected to ES:", info.version.number);
  } catch (err) {
    log.error("Connection failed:", err?.message || err);
    throw err;
  }
};

export default client;
