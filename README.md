# AI Grading Platform

An AI-powered assessment platform for educational institutions. Lecturers create assessments with rubrics, students submit answers, and the system automatically grades MCQ questions on submission and subjective questions via AWS Bedrock.

---

## Architecture

The platform is split into two services that share a PostgreSQL database:

```
ai-powered-grading-system/   ← This repo (Next.js)
verion-ai-grader/            ← Separate repo (Django microservice)
```

**Next.js app** handles everything user-facing: auth, assessment creation, student submissions, MCQ auto-scoring, results display, and admin configuration.

**Django grader** handles AI grading: reads submitted subjective answers, calls AWS Bedrock, writes final scores back, and stores per-answer feedback.

See [GRADING_FLOW.md](./GRADING_FLOW.md) for the full end-to-end flow.

---

## Features

- **Assessments** — Lecturers create exams, quizzes, and assignments with MCQ and subjective sections
- **Rubrics** — Per-question scoring criteria used to guide AI grading
- **MCQ auto-scoring** — Instant scoring at submission time
- **AI grading** — Subjective answers graded by AWS Bedrock with per-criterion feedback
- **Plagiarism detection** — Answer hash comparison flags identical submissions
- **Configurable grading scale** — Admin sets grade bands (A+, A, B, etc.) with custom thresholds; grade letters computed on read, never stored
- **Results release** — Lecturers control when students see their scores
- **Roles** — Admin, Lecturer, Student

---

## Tech Stack

- [Next.js](https://nextjs.org/) — Frontend and API routes
- [Prisma](https://www.prisma.io/) — ORM for PostgreSQL
- [TypeScript](https://www.typescriptlang.org/)
- PostgreSQL — shared with the Django grader service

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL
- The `verion-ai-grader` Django service (for subjective grading)

### Install and run

```bash
pnpm install
pnpm dev
```

### Database setup

```bash
# Apply all migrations
npx prisma migrate deploy

# Regenerate Prisma client after schema changes
npx prisma generate
```

> **Important:** Do not run `prisma migrate dev` for the `GradingResult` and `AnswerFeedback` models — those tables are created by the Django grader's own migrations. Only run `prisma generate` when the schema changes.

---

## Grading Scale

Grade letters are **not stored** in the database. Only the raw numeric score is persisted. The letter grade is computed at read time using the scale configured by the admin.

**Configure at:** Admin → Settings → Grading Scale

Default scale: A+ ≥ 90%, A ≥ 85%, A- ≥ 80%, B+ ≥ 75%, B ≥ 70%, B- ≥ 65%, C+ ≥ 60%, C ≥ 55%, C- ≥ 50%, D+ ≥ 45%, D ≥ 40%, F ≥ 0%

The admin can add, remove, or rename any grade band. Changes take effect immediately.

---

## Key source files

| File | Purpose |
|------|---------|
| `src/lib/assessment-actions.ts` | MCQ auto-scoring, answer hashing, attempt submission |
| `src/lib/grading-scale.ts` | `computeGrade()` — pure function, reads scale from DB |
| `src/lib/grading-feedback.ts` | Read-only queries for AI feedback from grader tables |
| `src/lib/student-queries.ts` | Student dashboard and assessment queries |
| `src/app/actions/admin-settings-server.ts` | System settings including grading scale |
| `prisma/schema.prisma` | Full database schema |
| `GRADING_FLOW.md` | End-to-end grading flow documentation |
