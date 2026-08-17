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
  const payload = { student: { ...student, graduationDate: student.graduationDate.toISOString(), skills: student.skills.map(({ level, skill }) => ({ name: skill.name, level })), experiences: student.experiences.map((item) => ({ ...item, startDate: item.startDate.toISOString(), endDate: item.endDate?.toISOString() ?? null })), certificates: student.certificates.map((item) => ({ ...item, issueDate: item.issueDate.toISOString() })), awards: student.awards.map((item) => ({ ...item, awardedDate: item.awardedDate.toISOString() })), savedJobIds: student.savedJobs.map(({ jobId }) => jobId) }, jobs: rankedJobs.map((job) => ({ ...job, applicationDeadline: job.applicationDeadline.toISOString(), postedAt: job.postedAt.toISOString(), skills: undefined })) };
  return <CareerDashboard initialData={payload} />;
}
