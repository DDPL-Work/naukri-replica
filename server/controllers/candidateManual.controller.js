import Candidate from "../models/candidate.model.js";

export const addCandidateManual = async (req, res) => {
  try {
    const pdfUrl = req.file ? req.file.path : null;

    // Create Cloudinary inline view URL
    const inlinePdfUrl = pdfUrl
      ? pdfUrl.replace("/upload/", "/upload/fl_attachment:false/")
      : null;

    const toArray = (val) => {
      try {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        return JSON.parse(val);
      } catch {
        return val.split(",").map((v) => v.trim());
      }
    };

    const toDate = (val) => {
      if (!val || val === "null" || val === "undefined") return null;
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d;
    };

    const safeNumber = (val) => {
      if (!val) return null;
      const cleaned = val.toString().replace(/[^0-9.]/g, "");
      return cleaned ? Number(cleaned) : null;
    };

    const normalizeExperience = (value) => {
      if (!value) return null;
      const cleaned = value.toString().toLowerCase();
      if (cleaned.includes("-")) {
        const first = cleaned.split("-")[0].replace(/[^0-9.]/g, "");
        return first ? Number(first) : null;
      }
      const digits = cleaned.replace(/[^0-9.]/g, "");
      return digits ? Number(digits) : null;
    };

    const parseEducation = (val) => {
      try {
        return val ? JSON.parse(val) : [];
      } catch {
        return [];
      }
    };

    const unique_id =
      req.body.unique_id ||
      `UID-${Date.now()}-${Math.floor(Math.random() * 9999)}`;

    const data = {
      unique_id,
      name: req.body.name,
      email: req.body.email || null,
      mobile: req.body.mobile || null,
      gender: req.body.gender || null,
      location: req.body.location || null,
      qualification: req.body.qualification || null,

      // FIXED HERE
      resumeUrl: req.body.resumeUrl || null,
      pdfFile: inlinePdfUrl,

      portal: req.body.portal || null,
      portalDate: toDate(req.body.portalDate),

      experience: req.body.experience || null,
      relevantExp: normalizeExperience(req.body.relevantExp),

      designation: req.body.designation || null,
      recentCompany: req.body.recentCompany || null,

      education: parseEducation(req.body.education),

      applyDate: toDate(req.body.applyDate),
      callingDate: toDate(req.body.callingDate),

      currCTC: safeNumber(req.body.currCTC),
      expCTC: safeNumber(req.body.expCTC),

      topSkills: toArray(req.body.topSkills),
      skillsAll: toArray(req.body.skillsAll),

      companyNamesAll: toArray(req.body.companyNamesAll),

      feedback: req.body.feedback || null,
      remark: req.body.remark || null,
      jdBrief: req.body.jdBrief || null,

      createdBy: req.user?.id || null,
    };

    const saved = await Candidate.create(data);

    res.status(201).json({
      success: true,
      message: "Candidate added successfully",
      candidate: saved,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to add candidate",
      reason: err.message,
    });
  }
};
