/*
  Warnings:

  - You are about to drop the column `sections` on the `assessment_classes` table. All the data in the column will be lost.
  - You are about to drop the column `sectionAWeight` on the `assessments` table. All the data in the column will be lost.
  - You are about to drop the column `sectionBWeight` on the `assessments` table. All the data in the column will be lost.
  - You are about to drop the column `section` on the `question_bank_items` table. All the data in the column will be lost.
  - You are about to drop the column `section` on the `questions` table. All the data in the column will be lost.
  - Added the required column `type` to the `question_bank_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sectionId` to the `questions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SectionType" AS ENUM ('OBJECTIVE', 'SUBJECTIVE');

-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'TIMED_OUT');

-- AlterTable
ALTER TABLE "assessment_classes" DROP COLUMN "sections";

-- AlterTable
ALTER TABLE "assessments" DROP COLUMN "sectionAWeight",
DROP COLUMN "sectionBWeight";

-- AlterTable
ALTER TABLE "question_bank_items" DROP COLUMN "section",
ADD COLUMN     "type" "SectionType" NOT NULL;

-- AlterTable
ALTER TABLE "questions" DROP COLUMN "section",
ADD COLUMN     "sectionId" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "Section";

-- CreateTable
CREATE TABLE "assessment_sections" (
    "id" SERIAL NOT NULL,
    "assessmentId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" "SectionType" NOT NULL,
    "requiredQuestionsCount" INTEGER,

    CONSTRAINT "assessment_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_attempts" (
    "id" SERIAL NOT NULL,
    "assessmentId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "status" "AttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "score" DOUBLE PRECISION,
    "grade" TEXT,
    "attemptNumber" INTEGER NOT NULL,
    "questionOrder" JSONB NOT NULL DEFAULT '[]',
    "tabSwitchLog" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "assessment_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_answers" (
    "id" SERIAL NOT NULL,
    "attemptId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "answerText" TEXT,
    "selectedOption" INTEGER,
    "fileUrl" TEXT,
    "answerHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assessment_attempts_assessmentId_studentId_attemptNumber_key" ON "assessment_attempts"("assessmentId", "studentId", "attemptNumber");

-- CreateIndex
CREATE UNIQUE INDEX "student_answers_attemptId_questionId_key" ON "student_answers"("attemptId", "questionId");

-- AddForeignKey
ALTER TABLE "assessment_sections" ADD CONSTRAINT "assessment_sections_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "assessment_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "assessment_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_answers" ADD CONSTRAINT "student_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
