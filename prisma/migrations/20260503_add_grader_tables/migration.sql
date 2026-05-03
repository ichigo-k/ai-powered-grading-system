-- Migration: create grader feedback tables
-- These tables are written to by the verion-ai-grader Django service and
-- read by the Next.js app. Prisma is the sole migration authority for them.
-- Django has managed = False on these models and will never ALTER or DROP them.

CREATE TABLE "grader_gradingresult" (
    "id"                SERIAL PRIMARY KEY,
    "attemptId"         INTEGER NOT NULL UNIQUE,
    "assessmentId"      INTEGER NOT NULL,
    "score"             DOUBLE PRECISION NOT NULL,
    "grade"             TEXT NOT NULL,
    "plagiarismFlagged" BOOLEAN NOT NULL DEFAULT false,
    "gradedAt"          TIMESTAMP(3) NOT NULL,
    "errorNotes"        TEXT NOT NULL DEFAULT ''
);

CREATE INDEX "grader_gradingresult_attemptId_idx"    ON "grader_gradingresult"("attemptId");
CREATE INDEX "grader_gradingresult_assessmentId_idx" ON "grader_gradingresult"("assessmentId");

CREATE TABLE "grader_answerfeedback" (
    "id"               SERIAL PRIMARY KEY,
    "gradingResultId"  INTEGER NOT NULL,
    "questionId"       INTEGER NOT NULL,
    "totalScore"       DOUBLE PRECISION NOT NULL,
    "maxScore"         DOUBLE PRECISION NOT NULL,
    "flag"             TEXT NOT NULL DEFAULT '',
    "flagReason"       TEXT NOT NULL DEFAULT '',
    "criteriaFeedback" JSONB NOT NULL DEFAULT '[]',
    "bedrockError"     BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "grader_answerfeedback_gradingResultId_fkey"
        FOREIGN KEY ("gradingResultId")
        REFERENCES "grader_gradingresult"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "grader_answerfeedback_questionId_idx"       ON "grader_answerfeedback"("questionId");
CREATE INDEX "grader_answerfeedback_gradingResultId_idx"  ON "grader_answerfeedback"("gradingResultId");
