import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";

const prisma = new PrismaClient();

const skillNames = ["Python", "SQL", "Tableau", "Excel", "R", "JavaScript", "React", "Node.js", "AWS", "Figma", "Git"];
const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

async function main() {
  for (const name of skillNames) await prisma.skill.upsert({ where: { name }, update: {}, create: { name } });
  const skills = Object.fromEntries((await prisma.skill.findMany()).map((skill) => [skill.name, skill.id]));

  const student = await prisma.student.upsert({
    where: { email: "maya.chen@example.com" },
    update: {},
    create: {
      name: "Maya Chen", email: "maya.chen@example.com", university: "University of New South Wales",
      studyYear: 3, major: "Computer Science & Data Science", gpa: 3.8,
      graduationDate: new Date("2027-11-30"), visaStatus: "Student visa (subclass 500)",
      visaWorkRights: "48 hours per fortnight during term; unrestricted during breaks",
      githubUrl: "https://github.com/mayachen", linkedinUrl: "https://linkedin.com/in/mayachen",
      preferredIndustries: ["Technology", "FinTech", "Consulting"],
      preferredPositions: ["Data Analyst", "Software Engineer", "Product Analyst"],
      preferredLocations: ["Sydney", "Melbourne", "Remote"], salaryMin: 65000, salaryMax: 85000,
      skills: { create: ["Python", "SQL", "Tableau", "Excel", "R", "Git"].map((name) => ({ level: ["Python", "SQL"].includes(name) ? "Advanced" : "Intermediate", skill: { connect: { id: skills[name] } } })) },
      languages: { create: [{ language: "English", proficiency: "Fluent" }, { language: "Mandarin", proficiency: "Native" }] },
      experiences: { create: [{ company: "DataCo Australia", title: "Data Analytics Intern", startDate: new Date("2026-06-01"), endDate: new Date("2026-08-31"), description: "Built SQL reporting pipelines and Tableau dashboards used by a 12-person commercial team." }] },
      projects: { create: [{ name: "Campus Compass", description: "A recommendation engine helping students discover societies and events.", technologies: ["Python", "SQL", "React"], projectUrl: "https://github.com/mayachen/campus-compass" }, { name: "Retail Demand Forecast", description: "Forecasted weekly demand with an 18% improvement over baseline.", technologies: ["Python", "R", "Tableau"] }] },
      certificates: { create: [{ name: "Google Data Analytics", issuer: "Google", issueDate: new Date("2026-03-15") }] },
      awards: { create: [{ name: "Dean's List", issuer: "UNSW", awardedDate: new Date("2026-12-01") }] }
    }
  });

  const jobs = [
    { company: "Atlassian", companyInitials: "A", companyColour: "#0f62d6", position: "Graduate Data Analyst", industry: "Technology", employmentType: "Graduate program", description: "Turn product and customer data into clear insights that help teams make better decisions.", responsibilities: ["Build reliable reports and dashboards", "Partner with product and commercial teams", "Communicate insights to stakeholders"], yearsExperience: 0, salaryMin: 76000, salaryMax: 84000, location: "Sydney", workMode: "Hybrid", visaRequirement: "Australian work rights required", applicationDeadline: new Date("2026-08-28"), skills: ["Python", "SQL", "Tableau", "Excel"] },
    { company: "Canva", companyInitials: "C", companyColour: "#8b3fe8", position: "Software Engineer Intern", industry: "Technology", employmentType: "Internship", description: "Join a product engineering team to build accessible, high-quality experiences used around the world.", responsibilities: ["Ship user-facing product improvements", "Write tested, maintainable code", "Collaborate with design and data"], yearsExperience: 0, salaryMin: 68000, salaryMax: 78000, location: "Sydney", workMode: "Hybrid", visaRequirement: "Student visa accepted", applicationDeadline: new Date("2026-09-05"), skills: ["JavaScript", "React", "Git", "Python"] },
    { company: "Commonwealth Bank", companyInitials: "CBA", companyColour: "#f5c400", position: "Product Analytics Graduate", industry: "FinTech", employmentType: "Graduate program", description: "Use customer data to improve digital banking journeys for millions of Australians.", responsibilities: ["Analyse customer journeys", "Design experiments and reporting", "Present recommendations to product leaders"], yearsExperience: 0, salaryMin: 72000, salaryMax: 82000, location: "Sydney", workMode: "Hybrid", visaRequirement: "Permanent work rights preferred", applicationDeadline: new Date("2026-08-19"), skills: ["SQL", "Python", "Tableau", "Excel"] },
    { company: "Deloitte", companyInitials: "D", companyColour: "#1e2a23", position: "Technology Consulting Analyst", industry: "Consulting", employmentType: "Graduate program", description: "Help clients solve complex technology and data challenges across Australia.", responsibilities: ["Research client challenges", "Model and communicate solutions", "Support delivery teams"], yearsExperience: 0, salaryMin: 67000, salaryMax: 75000, location: "Melbourne", workMode: "Flexible", visaRequirement: "Australian work rights required", applicationDeadline: new Date("2026-09-12"), skills: ["Excel", "SQL", "Python", "Tableau"] }
  ];

  if ((await prisma.job.count()) === 0) {
    for (const job of jobs) {
      const { skills: jobSkills, ...data } = job;
      await prisma.job.create({ data: { ...data, skills: { create: jobSkills.map((name) => ({ skill: { connect: { id: skills[name] } } })) } } });
    }
  }
  const firstJob = await prisma.job.findFirst({ orderBy: { id: "asc" } });
  if (firstJob) await prisma.savedJob.upsert({ where: { studentId_jobId: { studentId: student.id, jobId: firstJob.id } }, update: {}, create: { studentId: student.id, jobId: firstJob.id } });
  await prisma.user.upsert({
    where: { email: "maya.chen@example.com" },
    update: { studentId: student.id, role: "STUDENT" },
    create: { email: "maya.chen@example.com", passwordHash: hashPassword("Student123!"), role: "STUDENT", studentId: student.id }
  });
  await prisma.user.upsert({
    where: { email: "admin@pathway.app" },
    update: { role: "ADMIN" },
    create: { email: "admin@pathway.app", passwordHash: hashPassword(adminPassword), role: "ADMIN" }
  });
}

main().finally(() => prisma.$disconnect());
