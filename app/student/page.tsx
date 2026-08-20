import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { scoreJob } from "@/lib/matching";
import { CareerDashboard } from "../career-dashboard";

export const dynamic = "force-dynamic";

export default async function StudentHome() {
  const user = await requireUser("STUDENT");
  if (!user.studentId) redirect("/student/profile");
  const student = await prisma.student.findUnique({ where: { id: user.studentId }, include: { skills: { include: { skill: true } }, experiences: true, projects: true, languages: true, certificates: true, awards: true, savedJobs: true } });
  if (!student) redirect("/student/profile");
  const jobs = await prisma.job.findMany({ include: { skills: { include: { skill: true } } }, orderBy: { applicationDeadline: "asc" } });
  const rankedJobs = jobs.map((job) => ({ ...job, ...scoreJob(student, job) })).sort((a, b) => b.matchScore - a.matchScore);
  const studentPayload = {
    id: student.id, name: student.name, email: student.email, university: student.university, studyYear: student.studyYear,
    major: student.major, gpa: student.gpa, graduationDate: student.graduationDate.toISOString(), visaStatus: student.visaStatus,
    visaWorkRights: student.visaWorkRights, githubUrl: student.githubUrl, linkedinUrl: student.linkedinUrl,
    preferredIndustries: student.preferredIndustries, preferredPositions: student.preferredPositions,
    preferredLocations: student.preferredLocations, salaryMin: student.salaryMin, salaryMax: student.salaryMax,
    skills: student.skills.map(({ level, skill }) => ({ name: skill.name, level })),
    experiences: student.experiences.map(({ id, company, title, description, startDate, endDate }) => ({ id, company, title, description, startDate: startDate.toISOString(), endDate: endDate?.toISOString() ?? null })),
    projects: student.projects.map(({ id, name, description, technologies, projectUrl }) => ({ id, name, description, technologies, projectUrl })),
    languages: student.languages.map(({ id, language, proficiency }) => ({ id, language, proficiency })),
    certificates: student.certificates.map(({ id, name, issuer, issueDate }) => ({ id, name, issuer, issueDate: issueDate.toISOString() })),
    awards: student.awards.map(({ id, name, issuer, awardedDate }) => ({ id, name, issuer, awardedDate: awardedDate.toISOString() })),
    savedJobIds: student.savedJobs.map(({ jobId }) => jobId),
  };
  const payload = { generatedAt: new Date().toISOString(), student: studentPayload, jobs: rankedJobs.map((job) => ({ ...job, applicationDeadline: job.applicationDeadline.toISOString(), postedAt: job.postedAt.toISOString(), skills: undefined })) };
  return <CareerDashboard initialData={payload} />;
}
