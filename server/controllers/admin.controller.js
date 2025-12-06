// controllers/admin.controller.js
import User from "../models/user.model.js";
import DownloadLog from "../models/downloadLog.model.js";
import ActivityLog from "../models/activityLog.model.js";
import Candidate from "../models/candidate.model.js";

/**
 * List recruiters (admin only)
 */
export const listRecruiters = async (req, res, next) => {
  try {
    const recruiters = await User.find({ role: "RECRUITER" }, "-password").lean();
    res.json({ recruiters });
  } catch (err) {
    next(err);
  }
};

/**
 * Update recruiter's limit / activate / deactivate
 */
export const updateRecruiter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { dailyDownloadLimit, active } = req.body;

    const updated = await User.findByIdAndUpdate(
      id,
      { $set: {
          ...(dailyDownloadLimit !== undefined ? { dailyDownloadLimit } : {}),
          ...(active !== undefined ? { active } : {})
      }},
      { new: true }
    );

    res.json({ recruiter: updated });
  } catch (err) {
    next(err);
  }
};


/**
 * Get today's downloads per recruiter (summary)
 */
export const downloadsSummary = async (req, res, next) => {
  try {
    // simple aggregation: count downloads grouped by userId for today
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const agg = await DownloadLog.aggregate([
      { $match: { downloadedAt: { $gte: start, $lte: end } } },
      { $group: { _id: "$userId", count: { $sum: 1 } } },
    ]);

    res.json({ summary: agg });
  } catch (err) {
    next(err);
  }
};

/**
 * Advanced Analytics Controller
 */
export const analytics = async (req, res, next) => {
  try {
    // -------------------- BASIC COUNTS --------------------
    const totalCandidates = await Candidate.countDocuments();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const last7 = new Date();
    last7.setDate(last7.getDate() - 7);

    const todayCount = await Candidate.countDocuments({
      createdAt: { $gte: today },
    });

    const last7Count = await Candidate.countDocuments({
      createdAt: { $gte: last7 },
    });

    // -------------------- TOP LOCATIONS --------------------
    const topLocations = await Candidate.aggregate([
      {
        $match: {
          location: { $exists: true, $ne: null, $ne: "" },
        },
      },
      {
        $group: {
          _id: "$location",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // -------------------- TOP SKILLS --------------------
    const topSkills = await Candidate.aggregate([
      {
        $match: { skills: { $exists: true, $ne: null } }
      },
      {
        $project: {
          skills: {
            $cond: {
              if: { $isArray: "$skills" },
              then: "$skills",
              else: []
            }
          }
        }
      },
      { $unwind: "$skills" },
      {
        $group: {
          _id: "$skills",
          count: { $sum: 1 },
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // -------------------- RESUME SOURCE ANALYTICS --------------------
    const portalStats = await Candidate.aggregate([
      {
        $match: { portal: { $exists: true, $ne: null, $ne: "" } }
      },
      {
        $group: {
          _id: "$portal",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // -------------------- DAILY UPLOAD TREND (LAST 30 DAYS) --------------------
    const last30 = new Date();
    last30.setDate(last30.getDate() - 30);

    const last30Trend = await Candidate.aggregate([
      {
        $match: { createdAt: { $gte: last30 } }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // -------------------- TOP JOB TITLES --------------------
    const topDesignations = await Candidate.aggregate([
      {
        $match: { designation: { $exists: true, $ne: null, $ne: "" } }
      },
      {
        $group: {
          _id: "$designation",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // -------------------- EXPERIENCE RANGE BUCKETS --------------------
    const experienceBuckets = await Candidate.aggregate([
      {
        $bucket: {
          groupBy: "$experience",
          boundaries: [0, 2, 5, 10, 20, 50],
          default: "Unknown",
          output: { count: { $sum: 1 } }
        }
      }
    ]);

    // -------------------- SEND ALL IN ONE RESPONSE --------------------
    res.json({
      totalCandidates,
      todayCount,
      last7Count,

      topLocations,
      topSkills,

      portalStats,
      last30Trend,
      topDesignations,
      experienceBuckets,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    next(err);
  }
};

