// services/elasticsearch.service.js
import { Client } from "@elastic/elasticsearch";
import config from "../config/index.js";
import logger from "../config/logger.js";

const log = {
  info: (...args) => console.log("[INFO]", ...args),
  error: (...args) => console.error("[ERROR]", ...args),
};

const client = new Client({
  node: config.esNode,
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME || "elastic",
    password: process.env.ELASTICSEARCH_PASSWORD || "",
  },
  tls: { rejectUnauthorized: false },
});

const INDEX = process.env.ES_INDEX || "candidates";

/* -------------------------------------------------------
   1. Ensure index with CORRECT MAPPINGS
------------------------------------------------------- */
export const ensureIndex = async () => {
  try {
    const exists = await client.indices.exists({ index: INDEX });

    if (!exists.body) {
      await client.indices.create({
        index: INDEX,
        body: {
          mappings: {
            properties: {
              candidateId: { type: "keyword" },

              fullName: { type: "text" },
              designation: { type: "text" },

              topSkills: { type: "text" },
              skills: { type: "text" },

              recentCompany: { type: "text" },
              companyNamesAll: { type: "text" },

              location: { type: "keyword" },

              experience: { type: "float" },    // Numeric only
              ctcCurrent: { type: "float" },
              ctcExpected: { type: "float" },

              portal: { type: "keyword" },
              portalDate: { type: "date" },
              applyDate: { type: "date" },
            },
          },
        },
      });

      log.info(`Elasticsearch index created: ${INDEX}`);
    }
  } catch (err) {
    log.error("ES ensureIndex error:", err?.message || err);
  }
};

/* -------------------------------------------------------
   Helpers to clean data before indexing
------------------------------------------------------- */
const parseExperience = (value) => {
  if (!value) return null;

  // If "3-5" → take average = 4 or first value = 3
  if (typeof value === "string" && value.includes("-")) {
    const parts = value.split("-");
    const num = parseFloat(parts[0]);
    return isNaN(num) ? null : num;
  }

  const num = parseFloat(value);
  return isNaN(num) ? null : num;
};

/* -------------------------------------------------------
   2. Index Candidate (FIXED)
------------------------------------------------------- */
export const indexCandidate = async (candidate) => {
  try {
    const mongoId = candidate._id.toString();

    await client.index({
      index: INDEX,
      id: mongoId,
      refresh: true,
      body: {
        candidateId: mongoId,

        // FIX: manual candidates use name, bulk ones use fullName
        fullName: candidate.fullName || candidate.name,

        designation: candidate.designation,

        // FIX: manual candidates use skillsAll
        topSkills: candidate.topSkills || [],
        skills: candidate.skillsAll || [],

        recentCompany: candidate.recentCompany,
        companyNamesAll: candidate.companyNamesAll || [],

        location: candidate.location,

        // FIX: convert "3-5" or "2 Years" → numeric value
        experience: parseExperience(candidate.experience),

        // FIX: your DB uses currCTC, expCTC
        ctcCurrent: candidate.currCTC || 0,
        ctcExpected: candidate.expCTC || 0,

        portal: candidate.portal,
        portalDate: candidate.portalDate,
        applyDate: candidate.applyDate,
      },
    });

    log.info("Indexed:", mongoId);
  } catch (err) {
    log.error("ES indexing error", err);
  }
};

/* -------------------------------------------------------
   3. Search Wrapper
------------------------------------------------------- */
export const searchCandidatesES = async (queryBody) => {
  try {
    const result = await client.search({
      index: INDEX,
      body: queryBody,
    });

    return result.hits;
  } catch (err) {
    log.error("ES search error:", err?.message || err);
    throw err;
  }
};

export default client;
