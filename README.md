# Pathway

Pathway is a student job-matching application built with Next.js, TypeScript, Prisma, and PostgreSQL. It keeps a complete student profile, ranks opportunities, explains each match, saves roles, and creates tailored cover-letter drafts.

## Demo accounts

- Student: `maya.chen@example.com` / `Student123!`
- Administrator: `admin@pathway.app` / `Admin123!`

Sessions are stored in PostgreSQL and protected by secure, HTTP-only cookies. Student and administrator pages enforce their roles on the server.

## Run locally

```bash
pnpm db:setup
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Main data

- Student education, work rights, experience, projects, skills, languages, certificates, awards, links, and job preferences
- Job descriptions, requirements, skills, experience, salary, location, work mode, visa requirements, and deadlines
- Relational saved jobs and explainable match scores
- Administrator job creation and editing, plus student profile and match review

Copy `.env.example` to `.env` if needed. The included Docker Compose service provides PostgreSQL for local development.
