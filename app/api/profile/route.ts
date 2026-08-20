import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const list = (value: unknown) => String(value ?? "").split(",").map((item) => item.trim()).filter(Boolean);
const skillLevels = new Set(["Beginner", "Intermediate", "Advanced", "Expert"]);
type SubmittedSkill = { name: string; level: string };
export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  const input = await request.json();
  const salaryMin = Number(input.salaryMin), salaryMax = Number(input.salaryMax);
  if (!input.name || !input.university || salaryMin > salaryMax) return NextResponse.json({ error: "Check the required fields and salary range." }, { status: 400 });
  const submittedSkills: SubmittedSkill[] = Array.isArray(input.skills)
    ? input.skills.map((skill: unknown) => {
        const value = skill && typeof skill === "object" ? skill as Record<string, unknown> : {};
        return { name: String(value.name ?? "").trim(), level: String(value.level ?? "") };
      }).filter((skill: { name: string }) => skill.name)
    : list(input.skills).map((name) => ({ name, level: "Intermediate" }));
  const skills = [...new Map<string, SubmittedSkill>(submittedSkills.map((skill) => [skill.name.toLowerCase(), skill])).values()];
  const studentData = { name: String(input.name), email: String(input.email), university: String(input.university), studyYear: Number(input.studyYear), major: String(input.major), gpa: Number(input.gpa), graduationDate: new Date(input.graduationDate), visaStatus: String(input.visaStatus), visaWorkRights: String(input.visaWorkRights), githubUrl: input.githubUrl ? String(input.githubUrl) : null, linkedinUrl: input.linkedinUrl ? String(input.linkedinUrl) : null, preferredIndustries: list(input.preferredIndustries), preferredPositions: list(input.preferredPositions), preferredLocations: list(input.preferredLocations), salaryMin, salaryMax };
  if (!skills.length || skills.some((skill) => !skillLevels.has(skill.level))) return NextResponse.json({ error: "Add at least one skill and choose a valid proficiency level." }, { status: 400 });
  await prisma.$transaction(async (tx) => {
    const student = user.studentId ? await tx.student.update({ where: { id: user.studentId }, data: studentData }) : await tx.student.create({ data: studentData });
    if (!user.studentId) await tx.user.update({ where: { id: user.id }, data: { studentId: student.id } });
    await tx.studentSkill.deleteMany({ where: { studentId: student.id } });
    for (const { name, level } of skills) {
      const skill = await tx.skill.upsert({ where: { name }, update: {}, create: { name } });
      await tx.studentSkill.create({ data: { studentId: student.id, skillId: skill.id, level } });
    }
  });
  return NextResponse.json({ ok: true });
}
