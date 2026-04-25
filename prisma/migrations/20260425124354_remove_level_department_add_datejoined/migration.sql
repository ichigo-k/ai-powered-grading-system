/*
  Warnings:

  - You are about to drop the column `department` on the `admin_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `student_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "admin_profiles" DROP COLUMN "department";

-- AlterTable
ALTER TABLE "student_profiles" DROP COLUMN "level";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "dateJoined" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
