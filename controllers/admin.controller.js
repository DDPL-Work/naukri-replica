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
    const updated = await User.findByIdAndUpdate(id, { $set: { ...(dailyDownloadLimit !== undefined ? { dailyDownloadLimit } : {}), ...(active !== undefined ? { active } : {}) } }, { new: true });
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
 * Basic analytics: counts
 */
export const analytics = async (req, res, next) => {
  try {
    const totalCandidates = await Candidate.countDocuments();
    const today = new Date(); today.setHours(0,0,0,0);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);

    const todayCount = await Candidate.countDocuments({ createdAt: { $gte: today } });
    const last7 = new Date(); last7.setDate(last7.getDate() - 7);
    const last7Count = await Candidate.countDocuments({ createdAt: { $gte: last7 } });

    // top locations
    const topLocations = await Candidate.aggregate([
      { $group: { _id: "$location", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // top skills - unwind skills array
    const topSkills = await Candidate.aggregate([
      { $unwind: "$skills" },
      { $group: { _id: "$skills", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({ totalCandidates, todayCount, last7Count, topLocations, topSkills });
  } catch (err) {
    next(err);
  }
};
