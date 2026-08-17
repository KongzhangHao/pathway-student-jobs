type MatchStudent = { preferredIndustries: string[]; preferredPositions: string[]; preferredLocations: string[]; salaryMin: number; salaryMax: number; skills: { skill: { name: string } }[] };
type MatchJob = { industry: string; position: string; location: string; salaryMin: number; salaryMax: number; skills: { skill: { name: string } }[] };

export function scoreJob(student: MatchStudent, job: MatchJob) {
  const studentSkills = student.skills.map(({ skill }) => skill.name);
  const requiredSkills = job.skills.map(({ skill }) => skill.name);
  const matchingSkills = requiredSkills.filter((skill) => studentSkills.includes(skill));
  const missingSkills = requiredSkills.filter((skill) => !studentSkills.includes(skill));
  const industryFit = student.preferredIndustries.includes(job.industry);
  const locationFit = student.preferredLocations.includes(job.location);
  const salaryFit = job.salaryMax >= student.salaryMin && job.salaryMin <= student.salaryMax;
  const roleFit = student.preferredPositions.some((role) => job.position.toLowerCase().includes(role.split(" ")[0].toLowerCase()));
  const matchScore = Math.min(98, Math.round(35 + (matchingSkills.length / Math.max(requiredSkills.length, 1)) * 38 + (industryFit ? 9 : 0) + (locationFit ? 7 : 0) + (salaryFit ? 6 : 0) + (roleFit ? 5 : 0)));
  return { requiredSkills, matchingSkills, missingSkills, matchScore };
}
