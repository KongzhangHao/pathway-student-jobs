import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/app/profile-form";

export const dynamic = "force-dynamic";
export default async function CreateProfilePage() {
  const user = await requireUser("STUDENT");
  const student = user.studentId ? await prisma.student.findUnique({ where: { id: user.studentId }, include: { skills: { include: { skill: true } } } }) : null;
  const profile = student ? { ...student, graduationDate: student.graduationDate.toISOString(), skills: student.skills.map(({ level, skill }) => ({ name: skill.name, level })) } : null;
  return <main className="standalone-profile"><header><div className="login-logo dark"><span>p</span><strong>pathway</strong></div><a href="/student">Back to dashboard</a></header><section><span className="eyebrow">Your profile</span><h1>{profile ? "Update your story" : "Tell us what makes you, you"}</h1><p>Pathway uses this information to calculate and explain every job match.</p><ProfileForm profile={profile} /></section></main>;
}
