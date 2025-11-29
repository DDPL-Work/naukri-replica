// services/elasticsearch.service.js
import { Client } from "@elastic/elasticsearch";
import config from "../config/index.js";
import logger from "../config/logger.js";

const client = new Client({ node: config.esNode });

const INDEX = process.env.ES_INDEX || "candidates";

export const ensureIndex = async () => {
  try {
    const exists = await client.indices.exists({ index: INDEX });
    if (!exists) {
      await client.indices.create({
        index: INDEX,
        body: {
          mappings: {
            properties: {
              fullName: { type: "text" },
              designation: { type: "text" },
              topSkills: { type: "text" },
              skills: { type: "text" },
              recentCompany: { type: "text" },
              companyNamesAll: { type: "text" },
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
      logger.info("Elasticsearch index created:", INDEX);
    }
  } catch (err) {
    logger.error("ES ensureIndex error", err);
  }
};

export const indexCandidate = async (candidate) => {
  try {
    // candidate must be JS object with unique_id or _id
    const id = candidate.unique_id || candidate._id?.toString();
    await client.index({
      index: INDEX,
      id,
      refresh: true,
      body: {
        fullName: candidate.fullName,
        designation: candidate.designation,
        topSkills: candidate.topSkills || [],
        skills: candidate.skills || [],
        recentCompany: candidate.recentCompany,
        companyNamesAll: candidate.companyNamesAll || [],
        location: candidate.location,
        experience: candidate.experience,
        ctcCurrent: candidate.ctcCurrent,
        ctcExpected: candidate.ctcExpected,
        portal: candidate.portal,
        portalDate: candidate.portalDate,
        applyDate: candidate.applyDate,
      }
    });
  } catch (err) {
    logger.error("ES indexing error", err);
  }
};

export const searchCandidatesES = async (queryBody) => {
  const result = await client.search({ index: process.env.ES_INDEX || "candidates", body: queryBody });
  return result.hits;
};

export default client;
