type ProfileCompletenessInput = {
  name?: string;
  email?: string;
  university?: string;
  studyYear?: number;
  major?: string;
  gpa?: number;
  graduationDate?: string;
  visaStatus?: string;
  visaWorkRights?: string;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  preferredIndustries?: string[];
  preferredPositions?: string[];
  preferredLocations?: string[];
  salaryMin?: number;
  salaryMax?: number;
  skills?: { name: string; level: string }[];
  experiences?: unknown[];
  projects?: unknown[];
  languages?: unknown[];
  certificates?: unknown[];
  awards?: unknown[];
};

const present = (value: unknown) => typeof value === "string" ? value.trim().length > 0 : value !== null && value !== undefined;
const fraction = (checks: boolean[]) => checks.filter(Boolean).length / checks.length;

export function profileCompleteness(profile: ProfileCompletenessInput) {
  const personal = fraction([
    present(profile.name),
    present(profile.email),
    present(profile.university),
    Number.isFinite(profile.studyYear) && Number(profile.studyYear) > 0,
    present(profile.major),
    Number.isFinite(profile.gpa) && Number(profile.gpa) >= 0,
    present(profile.graduationDate),
  ]);
  const workRights = fraction([present(profile.visaStatus), present(profile.visaWorkRights)]);
  const preferences = fraction([
    Boolean(profile.preferredPositions?.length),
    Boolean(profile.preferredIndustries?.length),
    Boolean(profile.preferredLocations?.length),
    Number.isFinite(profile.salaryMin) && Number.isFinite(profile.salaryMax) && Number(profile.salaryMin) <= Number(profile.salaryMax),
  ]);
  const validSkills = profile.skills?.filter((skill) => present(skill.name) && present(skill.level)).length ?? 0;
  const skills = Math.min(validSkills / 5, 1);
  const evidenceSignals = [
    Boolean(profile.experiences?.length),
    Boolean(profile.projects?.length),
    present(profile.githubUrl),
    present(profile.linkedinUrl),
    Boolean(profile.languages?.length),
    Boolean(profile.certificates?.length),
    Boolean(profile.awards?.length),
  ].filter(Boolean).length;
  const evidence = Math.min(evidenceSignals / 2, 1);
  const score = Math.round(personal * 20 + workRights * 10 + preferences * 20 + skills * 30 + evidence * 20);
  const missing: string[] = [];
  if (personal < 1) missing.push("Complete your personal and study details");
  if (workRights < 1) missing.push("Add your visa and work-rights information");
  if (preferences < 1) missing.push("Complete your job preferences");
  if (validSkills < 5) missing.push(`Add ${5 - validSkills} more ${5 - validSkills === 1 ? "skill" : "skills"}`);
  if (evidenceSignals < 2) missing.push(`Add ${2 - evidenceSignals} more career evidence ${2 - evidenceSignals === 1 ? "item" : "items"}`);
  return { score, missing };
}
