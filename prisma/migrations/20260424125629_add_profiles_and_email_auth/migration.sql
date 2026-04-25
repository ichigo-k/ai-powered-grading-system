/*
  Warnings:

  - You are about to drop the column `staffId` on the `admin_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `admin_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `staffId` on the `lecturer_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `lecturer_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `indexNumber` on the `student_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `student_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "admin_profiles" DROP CONSTRAINT "admin_profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "lecturer_profiles" DROP CONSTRAINT "lecturer_profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "student_profiles" DROP CONSTRAINT "student_profiles_userId_fkey";

-- DropIndex
DROP INDEX "admin_profiles_staffId_key";

-- DropIndex
DROP INDEX "admin_profiles_userId_key";

-- DropIndex
DROP INDEX "lecturer_profiles_staffId_key";

-- DropIndex
DROP INDEX "lecturer_profiles_userId_key";

-- DropIndex
DROP INDEX "student_profiles_indexNumber_key";

-- DropIndex
DROP INDEX "student_profiles_userId_key";

-- DropIndex
DROP INDEX "users_userId_key";

-- AlterTable
ALTER TABLE "admin_profiles" DROP COLUMN "staffId",
DROP COLUMN "userId",
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "admin_profiles_id_seq";

-- AlterTable
ALTER TABLE "lecturer_profiles" DROP COLUMN "staffId",
DROP COLUMN "userId",
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "lecturer_profiles_id_seq";

-- AlterTable
ALTER TABLE "student_profiles" DROP COLUMN "indexNumber",
DROP COLUMN "userId",
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "student_profiles_id_seq";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "userId";

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecturer_profiles" ADD CONSTRAINT "lecturer_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_profiles" ADD CONSTRAINT "admin_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
