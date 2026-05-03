# Assessment Grading Flow

## Overview

The system uses a hybrid grading approach:

- **MCQ questions** — auto-scored at submission time by the main system
- **Subjective questions** — graded by the `verion-ai-grader` Django microservice using AWS Bedrock
- **Grade letters** — never stored; computed on read from the admin-configured grading scale

---

## Grading Scale

Grade letters (A+, A, B, etc.) are **not stored in the database**. Only the raw numeric `score` is persisted on `assessment_attempts`. The letter grade is computed at read time using the scale configured by the admin.

**Admin configuration:** Settings → System Settings → Grading Scale

The scale is stored as a JSON array in `system_settings.gradingScale`:
```json
[
  { "label": "A+", "minPercent": 90 },
  { "label": "A",  "minPercent": 85 },
  { "label": "A-", "minPercent": 80 },
  { "label": "B+", "minPercent": 75 },
  { "label": "B",  "minPercent": 70 },
  { "label": "B-", "minPercent": 65 },
  { "label": "C+", "minPercent": 60 },
  { "label": "C",  "minPercent": 55 },
  { "label": "C-", "minPercent": 50 },
  { "label": "D+", "minPercent": 45 },
  { "label": "D",  "minPercent": 40 },
  { "label": "F",  "minPercent": 0  }
]
```

The admin can add, remove, or rename any grade band. The system picks up changes immediately — no migration needed.

**Utility:** `src/lib/grading-scale.ts` → `computeGrade(score, totalMarks, scale)`

---

## Full Flow

### 1. Student Submits

**File:** `src/lib/assessment-actions.ts` → `submitAttempt()`

- Hashes all answers (`answerHash`) for plagiarism detection
- Auto-scores MCQ questions by comparing `selectedOption` against `correctOption`
- Writes MCQ score to `assessment_attempts.score`
- Sets `assessment_attempts.status = SUBMITTED` (or `TIMED_OUT`)

**Result:** Attempt has a partial score (MCQ only). Subjective answers are stored but unscored.

---

### 2. Lecturer Triggers Grading

**UI:** Results page → "Grade Assessment" button

**API:** `POST /api/lecturer/assessments/[id]/start-grading`

Sets `assessments.gradingStatus = GRADING`.

---

### 3. Grader Service Processes

**Service:** `verion-ai-grader` (separate Django process)

Called via `POST /api/grade/assessment/{id}/` with an `X-API-Key` header.

What it does:
1. Fetches all `SUBMITTED` / `TIMED_OUT` attempts
2. Runs plagiarism detection across all `answerHash` values
3. For each attempt (up to `GRADING_CONCURRENCY` in parallel):
   - Fetches subjective answers
   - Calls AWS Bedrock per answer with rubric-guided or holistic prompt
   - Caps per-criterion scores at their `maxMarks`
   - Adds subjective scores to the existing MCQ score
   - Caps final score at `assessment.totalMarks`
   - Writes final `score` to `assessment_attempts.score`
   - Persists audit record to `grader_gradingresult`
   - Persists per-answer AI feedback to `grader_answerfeedback`
4. Sets `assessments.gradingStatus = GRADED`

**Score formula:**
```
final_score = min(mcq_score + sum(subjective_scores), totalMarks)
```

**Bedrock failure handling:** If Bedrock fails for one answer, that answer scores 0 and grading continues. The error is recorded in `grader_answerfeedback.bedrock_error` and `grader_gradingresult.error_notes`.

---

### 4. Lecturer Views Results

Results page shows grading status and per-student scores. Grade letters are computed on the fly from `score` using the admin-configured scale.

Grading status pill:
- 🟡 `GRADING` — "Grading in progress…"
- 🟢 `GRADED` — "Grading complete" + "Release Results" button

---

### 5. Lecturer Releases Results

**API:** `POST /api/lecturer/assessments/[id]/release-results`

Sets `assessments.resultsReleased = true`. Students can now see their scores and AI feedback.

---

### 6. Students View Results

Students see their numeric score and computed grade letter. If the assessment has subjective questions, they also see per-answer AI feedback (criteria scores + justifications) sourced from `grader_answerfeedback`.

---

## Database Tables

### Owned by main system (Next.js / Prisma)

| Table | Grader access |
|-------|--------------|
| `assessments` | Read `totalMarks`; write `gradingStatus = GRADED` |
| `assessment_attempts` | Read MCQ `score`; write final `score` |
| `assessment_sections` | Read only (filter by `type = SUBJECTIVE`) |
| `questions` | Read only |
| `rubric_criteria` | Read only |
| `student_answers` | Read only |
| `system_settings` | Main system only — stores `gradingScale` JSON |

### Owned by grader service (Django migrations)

| Table | Contents |
|-------|---------|
| `grader_gradingresult` | Per-attempt: score snapshot, plagiarism flag, error notes |
| `grader_answerfeedback` | Per-answer: AI feedback, criteria scores, justifications, flags |
| `auth_keys_apikey` | Hashed API keys for grader endpoint authentication |

The main system reads `grader_gradingresult` and `grader_answerfeedback` via **read-only Prisma models** (`src/lib/grading-feedback.ts`). It never writes to these tables.

---

## API Endpoints

### Main system

| Endpoint | Auth | Action |
|----------|------|--------|
| `POST /api/lecturer/assessments/[id]/start-grading` | Lecturer | Sets `gradingStatus = GRADING` |
| `POST /api/lecturer/assessments/[id]/release-results` | Lecturer | Sets `resultsReleased = true` |

### Grader service

| Endpoint | Auth | Action |
|----------|------|--------|
| `POST /api/grade/assessment/{id}/` | X-API-Key | Batch grade all eligible attempts |
| `POST /api/grade/attempt/{id}/` | X-API-Key | Grade a single attempt |

---

## UI States

| `gradingStatus` | `resultsReleased` | UI |
|-----------------|-------------------|----|
| `NOT_GRADED` | `false` | "Grade Assessment" button |
| `GRADING` | `false` | 🟡 "Grading in progress…" pill |
| `GRADED` | `false` | 🟢 "Grading complete" + "Release Results" button |
| `GRADED` | `true` | 🟢 "Results released" badge |

---

## Testing Without the Grader Service

Simulate the grader writing back scores directly:

```sql
-- Write a final score for an attempt
UPDATE assessment_attempts
SET score = 74.5
WHERE id = <attempt_id>;

-- Mark assessment as graded
UPDATE assessments
SET "gradingStatus" = 'GRADED'
WHERE id = <assessment_id>;
```

The grade letter will be computed automatically from the score when the results page loads.

---

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/assessment-actions.ts` | MCQ auto-scoring at submission |
| `src/lib/grading-scale.ts` | `computeGrade()` utility — pure function, no DB |
| `src/lib/grading-feedback.ts` | Read-only queries for grader feedback tables |
| `src/lib/student-queries.ts` | Student-facing queries — computes grade on read |
| `src/app/actions/admin-settings-server.ts` | Save/load grading scale from system settings |
| `src/app/(admin)/admin/settings/SystemSettingsForm.tsx` | Admin UI for configuring grade bands |
