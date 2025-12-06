import DownloadLog from "../models/downloadLog.model.js";
import User from "../models/user.model.js";

/**
 * Check if recruiter can view more resumes today
 */
export const canDownloadResume = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const count = await DownloadLog.countDocuments({
    userId,
    downloadedAt: { $gte: todayStart, $lte: todayEnd },
  });

  return count < (user.dailyDownloadLimit || 0);
};

/**
 * Log resume view action
 */
export const logDownload = async (userId, candidateId) => {
  await DownloadLog.create({
    userId,
    candidateId,
    downloadedAt: new Date(),
  });
};
