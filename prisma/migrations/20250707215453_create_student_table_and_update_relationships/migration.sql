/*
  Warnings:

  - You are about to drop the column `contactPerson` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `clientId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `enrollmentDate` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cpf]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cnpj]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[systemUsername]` on the table `Client` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "AccountReceivable" DROP CONSTRAINT "AccountReceivable_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Certificate" DROP CONSTRAINT "Certificate_studentId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_clientId_fkey";

-- DropForeignKey
ALTER TABLE "_ClassStudents" DROP CONSTRAINT "_ClassStudents_B_fkey";

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "contactPerson",
DROP COLUMN "phone",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "cnpj" TEXT,
ADD COLUMN     "corporateName" TEXT,
ADD COLUMN     "cpf" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "landlineAreaCode" TEXT,
ADD COLUMN     "landlineNumber" TEXT,
ADD COLUMN     "mobileAreaCode" TEXT,
ADD COLUMN     "mobileNumber" TEXT,
ADD COLUMN     "municipalRegistration" TEXT,
ADD COLUMN     "neighborhood" TEXT,
ADD COLUMN     "number" TEXT,
ADD COLUMN     "observations" TEXT,
ADD COLUMN     "personType" TEXT NOT NULL DEFAULT 'FISICA',
ADD COLUMN     "responsibleEmail" TEXT,
ADD COLUMN     "responsibleName" TEXT,
ADD COLUMN     "responsiblePhone" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "stateRegistration" TEXT,
ADD COLUMN     "systemPassword" TEXT,
ADD COLUMN     "systemUsername" TEXT,
ADD COLUMN     "zipCode" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "clientId",
DROP COLUMN "enrollmentDate";

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "name" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "rg" TEXT,
    "gender" TEXT,
    "birthDate" TIMESTAMP(3),
    "education" TEXT,
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
    "observations" TEXT,
    "clientId" TEXT,
    "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_cpf_key" ON "Student"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE INDEX "Student_cpf_idx" ON "Student"("cpf");

-- CreateIndex
CREATE INDEX "Student_email_idx" ON "Student"("email");

-- CreateIndex
CREATE INDEX "Student_clientId_idx" ON "Student"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "Client_cpf_key" ON "Client"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Client_cnpj_key" ON "Client"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Client_systemUsername_key" ON "Client"("systemUsername");

-- CreateIndex
CREATE INDEX "Client_cpf_idx" ON "Client"("cpf");

-- CreateIndex
CREATE INDEX "Client_cnpj_idx" ON "Client"("cnpj");

-- CreateIndex
CREATE INDEX "Client_email_idx" ON "Client"("email");

-- CreateIndex
CREATE INDEX "Client_systemUsername_idx" ON "Client"("systemUsername");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountReceivable" ADD CONSTRAINT "AccountReceivable_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClassStudents" ADD CONSTRAINT "_ClassStudents_B_fkey" FOREIGN KEY ("B") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
