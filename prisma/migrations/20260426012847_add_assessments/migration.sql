-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('EXAM', 'QUIZ', 'ASSIGNMENT');

-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED');

-- CreateEnum
CREATE TYPE "Section" AS ENUM ('SECTION_A', 'SECTION_B');

-- CreateEnum
CREATE TYPE "AnswerType" AS ENUM ('FILL_IN', 'PDF_UPLOAD', 'CODE');

-- CreateTable
CREATE TABLE "assessments" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "type" "AssessmentType" NOT NULL,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'DRAFT',
    "courseId" INTEGER NOT NULL,
    "lecturerId" INTEGER NOT NULL,
    "totalMarks" INTEGER NOT NULL,
    "sectionAWeight" INTEGER NOT NULL,
    "sectionBWeight" INTEGER NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER,
    "maxAttempts" INTEGER NOT NULL DEFAULT 1,
    "passwordProtected" BOOLEAN NOT NULL DEFAULT false,
    "accessPassword" TEXT,
    "shuffleQuestions" BOOLEAN NOT NULL DEFAULT false,
    "shuffleOptions" BOOLEAN NOT NULL DEFAULT false,
    "isLocationBound" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_classes" (
    "id" SERIAL NOT NULL,
    "assessmentId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "sections" "Section"[],

    CONSTRAINT "assessment_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" SERIAL NOT NULL,
    "assessmentId" INTEGER NOT NULL,
    "section" "Section" NOT NULL,
    "order" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "marks" INTEGER NOT NULL,
    "answerType" "AnswerType",
    "options" JSONB,
    "correctOption" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rubric_criteria" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "maxMarks" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "rubric_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_banks" (
    "id" SERIAL NOT NULL,
    "lecturerId" INTEGER NOT NULL,
    "courseId" INTEGER,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_bank_items" (
    "id" SERIAL NOT NULL,
    "bankId" INTEGER NOT NULL,
    "section" "Section" NOT NULL,
    "body" TEXT NOT NULL,
    "marks" INTEGER NOT NULL,
    "answerType" "AnswerType",
    "options" JSONB,
    "correctOption" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_bank_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_bank_item_rubrics" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "maxMarks" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "question_bank_item_rubrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assessment_classes_assessmentId_classId_key" ON "assessment_classes"("assessmentId", "classId");

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "lecturer_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_classes" ADD CONSTRAINT "assessment_classes_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_classes" ADD CONSTRAINT "assessment_classes_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_criteria" ADD CONSTRAINT "rubric_criteria_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_banks" ADD CONSTRAINT "question_banks_lecturerId_fkey" FOREIGN KEY ("lecturerId") REFERENCES "lecturer_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_banks" ADD CONSTRAINT "question_banks_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_bank_items" ADD CONSTRAINT "question_bank_items_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "question_banks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_bank_item_rubrics" ADD CONSTRAINT "question_bank_item_rubrics_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "question_bank_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
