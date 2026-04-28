# Assessment Grading Flow

## Overview
The system uses a hybrid grading approach: **MCQ auto-graded** on submission, **subjective questions graded externally** by a separate grader service that has direct DB access.

---

## Database Schema Changes

### New Enum: `GradingStatus`
```prisma
enum GradingStatus {
  NOT_GRADED  // Initial state
  GRADING     // Lecturer triggered grading, external grader is working
  GRADED      // External grader finished, all scores written
}
```

### New Fields on `Assessment`
```prisma
model Assessment {
  // ... existing fields
  gradingStatus   GradingStatus @default(NOT_GRADED)
  resultsReleased Boolean       @default(false)
}
```

### Migration
Run when DB is available:
```bash
npx prisma migrate deploy
```

Or apply manually:
```sql
-- See: prisma/migrations/20260428_add_grading_status_and_release/migration.sql
CREATE TYPE "GradingStatus" AS ENUM ('NOT_GRADED', 'GRADING', 'GRADED');
ALTER TABLE "assessments"
  ADD COLUMN "gradingStatus" "GradingStatus" NOT NULL DEFAULT 'NOT_GRADED',
  ADD COLUMN "resultsReleased" BOOLEAN NOT NULL DEFAULT false;
```

---

## Flow

### 1. Student Submits Assessment

**File:** `src/lib/assessment-actions.ts` → `submitAttempt()`

- Hashes all answers for integrity
- **Auto-scores MCQ questions** (checks `selectedOption` against `correctOption`)
- Calculates partial score and grade (MCQ only)
- Sets `AssessmentAttempt.status = SUBMITTED` (or `TIMED_OUT`)
- Writes `score` and `grade` to attempt record

**Result:** Student has a partial score (MCQ only). Subjective answers are stored but not scored yet.

---

### 2. Lecturer Triggers Grading

**UI:** Results page → **"Grade Assessment"** button

**API:** `POST /api/lecturer/assessments/[id]/start-grading`

**Action:**
```typescript
await prisma.assessment.update({
  where: { id: assessmentId },
  data: { gradingStatus: "GRADING" },
})
```

**Result:** `gradingStatus = GRADING`. External grader can now detect this assessment needs grading.

---

### 3. External Grader Processes

**External Service** (not part of this codebase):
- Polls or queries DB for assessments where `gradingStatus = 'GRADING'`
- Reads `AssessmentAttempt` records with `status IN ('SUBMITTED', 'TIMED_OUT')`
- Reads `StudentAnswer` records for subjective questions
- Grades subjective answers (AI/manual/hybrid)
- **Writes scores back to DB:**
  ```sql
  UPDATE assessment_attempts
  SET score = <new_total_score>, grade = <new_grade>
  WHERE id = <attempt_id>;
  ```
- After all attempts graded:
  ```sql
  UPDATE assessments
  SET "gradingStatus" = 'GRADED'
  WHERE id = <assessment_id>;
  ```

**Result:** All attempts have final scores. `gradingStatus = GRADED`.

---

### 4. Lecturer Views Progress

**UI:** Results page auto-refreshes or lecturer refreshes manually

**Display:**
- Shows **X / Y graded** (e.g., "8 / 10 graded")
- Grading status pill:
  - 🟡 **"Grading in progress…"** (animated pulse) when `GRADING`
  - 🟢 **"Grading complete"** when `GRADED`

**Data Source:**
```typescript
const gradedCount = submissions.filter(s => s.status === "GRADED").length
const submittedCount = submissions.length
```

---

### 5. Lecturer Releases Results

**UI:** Results page → **"Release Results"** button (only visible when `gradingStatus = GRADED`)

**API:** `POST /api/lecturer/assessments/[id]/release-results`

**Action:**
```typescript
if (assessment.gradingStatus !== "GRADED") {
  return { error: "Grading not complete" }
}
await prisma.assessment.update({
  where: { id: assessmentId },
  data: { resultsReleased: true },
})
```

**Result:** `resultsReleased = true`. Students can now see their scores.

---

### 6. Students View Results

**UI:** Student assessment detail page or dashboard

**Logic:**
```typescript
const assessment = await getAssessmentWithQuestions(assessmentId)
if (!assessment.resultsReleased) {
  // Hide scores, show "Results pending"
}
```

**Display:**
- If `resultsReleased = false`: "Results pending" or similar
- If `resultsReleased = true`: Show score, grade, breakdown

---

## API Endpoints

### `POST /api/lecturer/assessments/[id]/start-grading`
- **Auth:** Lecturer only
- **Action:** Sets `gradingStatus = GRADING`
- **Returns:** `{ success: true, gradingStatus: "GRADING" }`

### `POST /api/lecturer/assessments/[id]/release-results`
- **Auth:** Lecturer only
- **Validation:** Requires `gradingStatus = GRADED`
- **Action:** Sets `resultsReleased = true`
- **Returns:** `{ success: true, resultsReleased: true }`

---

## External Grader Integration

### What the External Grader Needs

1. **Direct DB access** (PostgreSQL connection string)
2. **Read access:**
   - `assessments` (filter by `gradingStatus = 'GRADING'`)
   - `assessment_attempts` (filter by `status IN ('SUBMITTED', 'TIMED_OUT')`)
   - `student_answers` (join on `attemptId`)
   - `questions` (to know which are subjective, marks, rubrics)
3. **Write access:**
   - Update `assessment_attempts.score` and `assessment_attempts.grade`
   - Update `assessments.gradingStatus` to `'GRADED'` when done

### Example Query for External Grader

```sql
-- Find assessments needing grading
SELECT id, title, "totalMarks"
FROM assessments
WHERE "gradingStatus" = 'GRADING';

-- Get all submitted attempts for an assessment
SELECT id, "studentId", "attemptNumber", score, grade
FROM assessment_attempts
WHERE "assessmentId" = $1
  AND status IN ('SUBMITTED', 'TIMED_OUT');

-- Get subjective answers for an attempt
SELECT sa.id, sa."answerText", sa."fileUrl", q.body, q.marks, q."answerType"
FROM student_answers sa
JOIN questions q ON sa."questionId" = q.id
JOIN assessment_sections s ON q."sectionId" = s.id
WHERE sa."attemptId" = $1
  AND s.type = 'SUBJECTIVE';

-- Write back scores
UPDATE assessment_attempts
SET score = $1, grade = $2
WHERE id = $3;

-- Mark assessment as graded
UPDATE assessments
SET "gradingStatus" = 'GRADED'
WHERE id = $1;
```

---

## UI States

### Results Page (`/lecturer/assessments/[id]/results`)

| `gradingStatus` | `resultsReleased` | UI State |
|-----------------|-------------------|----------|
| `NOT_GRADED` | `false` | **"Grade Assessment"** button visible |
| `GRADING` | `false` | 🟡 **"Grading in progress… X / Y graded"** pill, no buttons |
| `GRADED` | `false` | 🟢 **"Grading complete X / Y graded"** + **"Release Results"** button |
| `GRADED` | `true` | 🟢 **"Results released to students"** badge |

---

## Testing Without External Grader

To simulate the external grader for testing:

```sql
-- Manually mark an assessment as graded
UPDATE assessments
SET "gradingStatus" = 'GRADED'
WHERE id = <assessment_id>;

-- Manually update attempt scores (simulate grader writing back)
UPDATE assessment_attempts
SET score = 85, grade = 'A'
WHERE "assessmentId" = <assessment_id>
  AND status IN ('SUBMITTED', 'TIMED_OUT');
```

Then refresh the results page — you'll see "Grading complete" and the "Release Results" button.

---

## Summary

✅ **MCQ auto-scored** on submission (instant partial results)  
✅ **Lecturer triggers grading** → sets `gradingStatus = GRADING`  
✅ **External grader** reads DB, grades subjective, writes scores, sets `gradingStatus = GRADED`  
✅ **Lecturer sees progress** → X / Y graded  
✅ **Lecturer releases results** → students can see scores  
✅ **No webhook needed** — external grader has direct DB access
