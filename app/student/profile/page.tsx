import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/app/profile-form";

export const dynamic = "force-dynamic";
export default async function CreateProfilePage() {
  const user = await requireUser("STUDENT");
  const student = user.studentId ? await prisma.student.findUnique({ where: { id: user.studentId }, include: { skills: { include: { skill: true } }, experiences: true, projects: true, languages: true, certificates: true, awards: true } }) : null;
  const profile = student ? {
    name: student.name, email: student.email, university: student.university, studyYear: student.studyYear, major: student.major,
    gpa: student.gpa, graduationDate: student.graduationDate.toISOString(), visaStatus: student.visaStatus,
    visaWorkRights: student.visaWorkRights, githubUrl: student.githubUrl, linkedinUrl: student.linkedinUrl,
    preferredIndustries: student.preferredIndustries, preferredPositions: student.preferredPositions,
    preferredLocations: student.preferredLocations, salaryMin: student.salaryMin, salaryMax: student.salaryMax,
    skills: student.skills.map(({ level, skill }) => ({ name: skill.name, level })),
    experiences: student.experiences.map(({ company, title, description, startDate, endDate }) => ({ company, title, description, startDate: startDate.toISOString(), endDate: endDate?.toISOString() ?? null })),
    projects: student.projects.map(({ name, description, technologies, projectUrl }) => ({ name, description, technologies, projectUrl })),
    languages: student.languages.map(({ language, proficiency }) => ({ language, proficiency })),
    certificates: student.certificates.map(({ name, issuer, issueDate }) => ({ name, issuer, issueDate: issueDate.toISOString() })),
    awards: student.awards.map(({ name, issuer, awardedDate }) => ({ name, issuer, awardedDate: awardedDate.toISOString() })),
  } : null;
  return <main className="standalone-profile"><header><div className="login-logo dark"><span>p</span><strong>pathway</strong></div><a href="/student">Back to dashboard</a></header><section><span className="eyebrow">Your profile</span><h1>{profile ? "Update your story" : "Tell us what makes you, you"}</h1><p>Pathway uses this information to calculate and explain every job match.</p><ProfileForm profile={profile} /></section></main>;
}
