/*
  Warnings:

  - You are about to drop the column `grade` on the `grader_gradingresult` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "grader_answerfeedback" DROP CONSTRAINT "grader_answerfeedback_gradingResultId_fkey";

-- DropIndex
DROP INDEX "grader_answerfeedback_gradingResultId_idx";

-- DropIndex
DROP INDEX "grader_answerfeedback_questionId_idx";

-- DropIndex
DROP INDEX "grader_gradingresult_assessmentId_idx";

-- DropIndex
DROP INDEX "grader_gradingresult_attemptId_idx";

-- AlterTable
ALTER TABLE "grader_gradingresult" DROP COLUMN "grade";

-- AddForeignKey
ALTER TABLE "grader_answerfeedback" ADD CONSTRAINT "grader_answerfeedback_gradingResultId_fkey" FOREIGN KEY ("gradingResultId") REFERENCES "grader_gradingresult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
