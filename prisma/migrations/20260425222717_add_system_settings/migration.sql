-- CreateTable
CREATE TABLE "system_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "academicYear" TEXT NOT NULL DEFAULT '2023/2024',
    "semester" TEXT NOT NULL DEFAULT 'First Semester',
    "contactEmail" TEXT NOT NULL DEFAULT 'admin@system.edu',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);
