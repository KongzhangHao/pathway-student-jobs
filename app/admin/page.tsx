import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scoreJob } from "@/lib/matching";
import { AdminDashboard } from "./admin-dashboard";

export const dynamic = "force-dynamic";
export default async function AdminPage() {
  const user = await requireUser("ADMIN");
  const [jobs, students] = await Promise.all([
    prisma.job.findMany({ include: { skills: { include: { skill: true } } }, orderBy: { postedAt: "desc" } }),
    prisma.student.findMany({ include: { skills: { include: { skill: true } }, experiences: true }, orderBy: { name: "asc" } })
  ]);
  const studentRows = students.map((student) => ({ id: student.id, name: student.name, email: student.email, university: student.university, major: student.major, graduationDate: student.graduationDate.toISOString(), visaStatus: student.visaStatus, preferredPositions: student.preferredPositions, preferredLocations: student.preferredLocations, skills: student.skills.map(({ skill }) => skill.name), matches: jobs.map((job) => ({ id: job.id, position: job.position, company: job.company, score: scoreJob(student, job).matchScore })).sort((a,b) => b.score-a.score).slice(0,3) }));
  const jobRows = jobs.map((job) => ({ ...job, applicationDeadline: job.applicationDeadline.toISOString(), postedAt: job.postedAt.toISOString(), skills: job.skills.map(({ skill }) => skill.name) }));
  return <AdminDashboard adminEmail={user.email} initialJobs={jobRows} students={studentRows} />;
}
