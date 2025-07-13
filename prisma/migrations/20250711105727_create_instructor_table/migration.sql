/*
  Warnings:

  - You are about to drop the column `address` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `addressNumber` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `cnpj` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `corporateName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `cpf` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `education` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `landlineAreaCode` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `landlineNumber` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `mobileAreaCode` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `mobileNumber` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `municipalRegistration` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `neighborhood` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `observations` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `personType` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `registrationNumber` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `stateRegistration` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `zipCode` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_instructorId_fkey";

-- DropForeignKey
ALTER TABLE "_InstructorTrainings" DROP CONSTRAINT "_InstructorTrainings_A_fkey";

-- DropForeignKey
ALTER TABLE "_InstructorTrainings" DROP CONSTRAINT "_InstructorTrainings_B_fkey";

-- DropIndex
DROP INDEX "User_cnpj_idx";

-- DropIndex
DROP INDEX "User_cnpj_key";

-- DropIndex
DROP INDEX "User_cpf_idx";

-- DropIndex
DROP INDEX "User_cpf_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "address",
DROP COLUMN "addressNumber",
DROP COLUMN "city",
DROP COLUMN "cnpj",
DROP COLUMN "corporateName",
DROP COLUMN "cpf",
DROP COLUMN "education",
DROP COLUMN "isActive",
DROP COLUMN "landlineAreaCode",
DROP COLUMN "landlineNumber",
DROP COLUMN "mobileAreaCode",
DROP COLUMN "mobileNumber",
DROP COLUMN "municipalRegistration",
DROP COLUMN "neighborhood",
DROP COLUMN "observations",
DROP COLUMN "personType",
DROP COLUMN "registrationNumber",
DROP COLUMN "state",
DROP COLUMN "stateRegistration",
DROP COLUMN "zipCode";

-- CreateTable
CREATE TABLE "Instructor" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "name" TEXT NOT NULL,
    "corporateName" TEXT,
    "personType" TEXT NOT NULL DEFAULT 'FISICA',
    "cpf" TEXT,
    "cnpj" TEXT,
    "municipalRegistration" TEXT,
    "stateRegistration" TEXT,
    "zipCode" TEXT,
    "address" TEXT,
    "addressNumber" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "state" TEXT,
    "landlineAreaCode" TEXT,
    "landlineNumber" TEXT,
    "mobileAreaCode" TEXT,
    "mobileNumber" TEXT,
    "email" TEXT,
    "education" TEXT,
    "registrationNumber" TEXT,
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Instructor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Instructor_userId_key" ON "Instructor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Instructor_cpf_key" ON "Instructor"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Instructor_cnpj_key" ON "Instructor"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Instructor_email_key" ON "Instructor"("email");

-- CreateIndex
CREATE INDEX "Instructor_cpf_idx" ON "Instructor"("cpf");

-- CreateIndex
CREATE INDEX "Instructor_cnpj_idx" ON "Instructor"("cnpj");

-- CreateIndex
CREATE INDEX "Instructor_email_idx" ON "Instructor"("email");

-- AddForeignKey
ALTER TABLE "Instructor" ADD CONSTRAINT "Instructor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InstructorTrainings" ADD CONSTRAINT "_InstructorTrainings_A_fkey" FOREIGN KEY ("A") REFERENCES "Instructor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InstructorTrainings" ADD CONSTRAINT "_InstructorTrainings_B_fkey" FOREIGN KEY ("B") REFERENCES "Training"("id") ON DELETE CASCADE ON UPDATE CASCADE;
