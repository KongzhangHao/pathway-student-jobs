type MatchStudent = { skills: { skill: { name: string } }[] };
type MatchJob = { skills: { skill: { name: string } }[] };

export function scoreJob(student: MatchStudent, job: MatchJob) {
  const studentSkills = new Set(student.skills.map(({ skill }) => skill.name.trim().toLowerCase()));
  const requiredSkills = job.skills.map(({ skill }) => skill.name);
  const matchingSkills = requiredSkills.filter((skill) => studentSkills.has(skill.trim().toLowerCase()));
  const missingSkills = requiredSkills.filter((skill) => !studentSkills.has(skill.trim().toLowerCase()));
  const matchScore = requiredSkills.length === 0 ? 0 : Math.round((matchingSkills.length / requiredSkills.length) * 100);
  return { requiredSkills, matchingSkills, missingSkills, matchScore };
}
