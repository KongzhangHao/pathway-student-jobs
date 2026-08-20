import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RecordValue = Record<string, unknown>;
type SubmittedSkill = { name: string; level: string };
const skillLevels = new Set(["Beginner", "Intermediate", "Advanced", "Expert"]);
const languageLevels = new Set(["Basic", "Conversational", "Professional", "Fluent", "Native"]);
const value = (input: unknown) => String(input ?? "").trim();
const list = (input: unknown) => value(input).split(",").map((item) => item.trim()).filter(Boolean);
const records = (input: unknown) => Array.isArray(input) ? input.map((item) => item && typeof item === "object" ? item as RecordValue : {}) : [];
const validDate = (input: string) => Boolean(input) && !Number.isNaN(new Date(input).getTime());
const validUrl = (input: string) => {
  if (!input) return true;
  try {
    const url = new URL(input);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") return NextResponse.json({ error: "Not authorised" }, { status: 401 });

  let input: RecordValue;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid profile data." }, { status: 400 });
  }

  const email = value(input.email).toLowerCase();
  const studyYear = Number(input.studyYear);
  const gpa = Number(input.gpa);
  const salaryMin = Number(input.salaryMin);
  const salaryMax = Number(input.salaryMax);
  const graduationDate = value(input.graduationDate);
  const preferredIndustries = list(input.preferredIndustries);
  const preferredPositions = list(input.preferredPositions);
  const preferredLocations = list(input.preferredLocations);
  const githubUrl = value(input.githubUrl);
  const linkedinUrl = value(input.linkedinUrl);

  if (!value(input.name) || !email || !email.includes("@") || !value(input.university) || !value(input.major) || !value(input.visaStatus) || !value(input.visaWorkRights)) {
    return NextResponse.json({ error: "Complete all required personal and study fields." }, { status: 400 });
  }
  if (!Number.isInteger(studyYear) || studyYear < 1 || studyYear > 8 || !Number.isFinite(gpa) || gpa < 0 || gpa > 7 || !validDate(graduationDate)) {
    return NextResponse.json({ error: "Check your study year, GPA, and graduation date." }, { status: 400 });
  }
  if (!preferredIndustries.length || !preferredPositions.length || !preferredLocations.length || !Number.isFinite(salaryMin) || !Number.isFinite(salaryMax) || salaryMin < 0 || salaryMin > salaryMax) {
    return NextResponse.json({ error: "Complete your job preferences and enter a valid salary range." }, { status: 400 });
  }
  if (!validUrl(githubUrl) || !validUrl(linkedinUrl)) {
    return NextResponse.json({ error: "GitHub and LinkedIn links must be valid web URLs." }, { status: 400 });
  }

  const submittedSkills: SubmittedSkill[] = Array.isArray(input.skills)
    ? records(input.skills).map((skill) => ({ name: value(skill.name), level: value(skill.level) })).filter((skill) => skill.name)
    : list(input.skills).map((name) => ({ name, level: "Intermediate" }));
  const skills = [...new Map<string, SubmittedSkill>(submittedSkills.map((skill) => [skill.name.toLowerCase(), skill])).values()];
  if (!skills.length || skills.some((skill) => !skillLevels.has(skill.level))) {
    return NextResponse.json({ error: "Add at least one skill and choose a valid proficiency level." }, { status: 400 });
  }

  const experiences = records(input.experiences).map((item) => ({
    company: value(item.company),
    title: value(item.title),
    startDate: value(item.startDate),
    endDate: value(item.endDate),
    description: value(item.description),
  }));
  if (experiences.some((item) => !item.company || !item.title || !item.description || !validDate(item.startDate) || (item.endDate && (!validDate(item.endDate) || new Date(item.endDate) < new Date(item.startDate))))) {
    return NextResponse.json({ error: "Check the required experience fields and date ranges." }, { status: 400 });
  }

  const projects = records(input.projects).map((item) => ({
    name: value(item.name),
    description: value(item.description),
    technologies: Array.isArray(item.technologies) ? item.technologies.map(value).filter(Boolean) : list(item.technologies),
    projectUrl: value(item.projectUrl),
  }));
  if (projects.some((item) => !item.name || !item.description || !item.technologies.length || !validUrl(item.projectUrl))) {
    return NextResponse.json({ error: "Check the required project fields, technologies, and project links." }, { status: 400 });
  }

  const languages = records(input.languages).map((item) => ({ language: value(item.language), proficiency: value(item.proficiency) }));
  if (languages.some((item) => !item.language || !languageLevels.has(item.proficiency))) {
    return NextResponse.json({ error: "Check each language and proficiency level." }, { status: 400 });
  }

  const certificates = records(input.certificates).map((item) => ({ name: value(item.name), issuer: value(item.issuer), issueDate: value(item.issueDate) }));
  if (certificates.some((item) => !item.name || !item.issuer || !validDate(item.issueDate))) {
    return NextResponse.json({ error: "Check each certificate name, issuer, and issue date." }, { status: 400 });
  }

  const awards = records(input.awards).map((item) => ({ name: value(item.name), issuer: value(item.issuer), awardedDate: value(item.awardedDate) }));
  if (awards.some((item) => !item.name || !item.issuer || !validDate(item.awardedDate))) {
    return NextResponse.json({ error: "Check each award name, issuer, and date." }, { status: 400 });
  }

  const studentData = {
    name: value(input.name),
    email,
    university: value(input.university),
    studyYear,
    major: value(input.major),
    gpa,
    graduationDate: new Date(graduationDate),
    visaStatus: value(input.visaStatus),
    visaWorkRights: value(input.visaWorkRights),
    githubUrl: githubUrl || null,
    linkedinUrl: linkedinUrl || null,
    preferredIndustries,
    preferredPositions,
    preferredLocations,
    salaryMin,
    salaryMax,
  };

  try {
    await prisma.$transaction(async (tx) => {
      const student = user.studentId
        ? await tx.student.update({ where: { id: user.studentId }, data: studentData })
        : await tx.student.create({ data: studentData });
      await tx.user.update({ where: { id: user.id }, data: { email, studentId: student.id } });

      await Promise.all([
        tx.studentSkill.deleteMany({ where: { studentId: student.id } }),
        tx.experience.deleteMany({ where: { studentId: student.id } }),
        tx.project.deleteMany({ where: { studentId: student.id } }),
        tx.studentLanguage.deleteMany({ where: { studentId: student.id } }),
        tx.certificate.deleteMany({ where: { studentId: student.id } }),
        tx.award.deleteMany({ where: { studentId: student.id } }),
      ]);

      for (const { name, level } of skills) {
        const skill = await tx.skill.upsert({ where: { name }, update: {}, create: { name } });
        await tx.studentSkill.create({ data: { studentId: student.id, skillId: skill.id, level } });
      }
      if (experiences.length) await tx.experience.createMany({ data: experiences.map((item) => ({ ...item, startDate: new Date(item.startDate), endDate: item.endDate ? new Date(item.endDate) : null, studentId: student.id })) });
      if (projects.length) await tx.project.createMany({ data: projects.map((item) => ({ ...item, projectUrl: item.projectUrl || null, studentId: student.id })) });
      if (languages.length) await tx.studentLanguage.createMany({ data: languages.map((item) => ({ ...item, studentId: student.id })) });
      if (certificates.length) await tx.certificate.createMany({ data: certificates.map((item) => ({ ...item, issueDate: new Date(item.issueDate), studentId: student.id })) });
      if (awards.length) await tx.award.createMany({ data: awards.map((item) => ({ ...item, awardedDate: new Date(item.awardedDate), studentId: student.id })) });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "That email address is already in use." }, { status: 409 });
    }
    throw error;
  }

  return NextResponse.json({ ok: true });
}
