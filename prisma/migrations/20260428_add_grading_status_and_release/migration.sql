-- CreateEnum
CREATE TYPE "GradingStatus" AS ENUM ('NOT_GRADED', 'GRADING', 'GRADED');

-- AlterTable
ALTER TABLE "assessments"
  ADD COLUMN "gradingStatus" "GradingStatus" NOT NULL DEFAULT 'NOT_GRADED',
  ADD COLUMN "resultsReleased" BOOLEAN NOT NULL DEFAULT false;
