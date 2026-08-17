CREATE TABLE "Student" (
  "id" SERIAL PRIMARY KEY, "name" TEXT NOT NULL, "email" TEXT NOT NULL UNIQUE,
  "university" TEXT NOT NULL, "studyYear" INTEGER NOT NULL, "major" TEXT NOT NULL,
  "gpa" DOUBLE PRECISION NOT NULL, "graduationDate" TIMESTAMP(3) NOT NULL,
  "visaStatus" TEXT NOT NULL, "visaWorkRights" TEXT NOT NULL, "githubUrl" TEXT,
  "linkedinUrl" TEXT, "preferredIndustries" TEXT[] NOT NULL, "preferredPositions" TEXT[] NOT NULL,
  "preferredLocations" TEXT[] NOT NULL, "salaryMin" INTEGER NOT NULL, "salaryMax" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE TABLE "Experience" ("id" SERIAL PRIMARY KEY, "studentId" INTEGER NOT NULL REFERENCES "Student"("id") ON DELETE CASCADE, "company" TEXT NOT NULL, "title" TEXT NOT NULL, "startDate" TIMESTAMP(3) NOT NULL, "endDate" TIMESTAMP(3), "description" TEXT NOT NULL);
CREATE TABLE "Project" ("id" SERIAL PRIMARY KEY, "studentId" INTEGER NOT NULL REFERENCES "Student"("id") ON DELETE CASCADE, "name" TEXT NOT NULL, "description" TEXT NOT NULL, "technologies" TEXT[] NOT NULL, "projectUrl" TEXT);
CREATE TABLE "Skill" ("id" SERIAL PRIMARY KEY, "name" TEXT NOT NULL UNIQUE);
CREATE TABLE "StudentSkill" ("studentId" INTEGER NOT NULL REFERENCES "Student"("id") ON DELETE CASCADE, "skillId" INTEGER NOT NULL REFERENCES "Skill"("id") ON DELETE CASCADE, "level" TEXT NOT NULL, PRIMARY KEY ("studentId", "skillId"));
CREATE TABLE "StudentLanguage" ("id" SERIAL PRIMARY KEY, "studentId" INTEGER NOT NULL REFERENCES "Student"("id") ON DELETE CASCADE, "language" TEXT NOT NULL, "proficiency" TEXT NOT NULL);
CREATE TABLE "Certificate" ("id" SERIAL PRIMARY KEY, "studentId" INTEGER NOT NULL REFERENCES "Student"("id") ON DELETE CASCADE, "name" TEXT NOT NULL, "issuer" TEXT NOT NULL, "issueDate" TIMESTAMP(3) NOT NULL);
CREATE TABLE "Award" ("id" SERIAL PRIMARY KEY, "studentId" INTEGER NOT NULL REFERENCES "Student"("id") ON DELETE CASCADE, "name" TEXT NOT NULL, "issuer" TEXT NOT NULL, "awardedDate" TIMESTAMP(3) NOT NULL);
CREATE TABLE "Job" ("id" SERIAL PRIMARY KEY, "company" TEXT NOT NULL, "companyInitials" TEXT NOT NULL, "companyColour" TEXT NOT NULL, "position" TEXT NOT NULL, "industry" TEXT NOT NULL, "employmentType" TEXT NOT NULL, "description" TEXT NOT NULL, "responsibilities" TEXT[] NOT NULL, "yearsExperience" INTEGER NOT NULL, "salaryMin" INTEGER NOT NULL, "salaryMax" INTEGER NOT NULL, "location" TEXT NOT NULL, "workMode" TEXT NOT NULL, "visaRequirement" TEXT NOT NULL, "applicationDeadline" TIMESTAMP(3) NOT NULL, "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "JobSkill" ("jobId" INTEGER NOT NULL REFERENCES "Job"("id") ON DELETE CASCADE, "skillId" INTEGER NOT NULL REFERENCES "Skill"("id") ON DELETE CASCADE, "required" BOOLEAN NOT NULL DEFAULT true, PRIMARY KEY ("jobId", "skillId"));
CREATE TABLE "SavedJob" ("studentId" INTEGER NOT NULL REFERENCES "Student"("id") ON DELETE CASCADE, "jobId" INTEGER NOT NULL REFERENCES "Job"("id") ON DELETE CASCADE, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY ("studentId", "jobId"));
