export function normalizeCandidate(raw) {
  if (!raw) return {};

  const src = raw.source || {};

  const candidate = { ...src, ...raw };

  candidate.id =
    candidate._id || candidate.candidateId || raw.id || src.candidateId;

  candidate.displayName =
    candidate.fullName ||
    candidate.name ||
    candidate.candidateName ||
    (candidate.firstName && candidate.lastName
      ? `${candidate.firstName} ${candidate.lastName}`
      : "") ||
    "Unknown";

  candidate.skillsList =
    candidate.skills?.length
      ? candidate.skills
      : candidate.topSkills?.length
      ? candidate.topSkills
      : [];

  return candidate;
}
