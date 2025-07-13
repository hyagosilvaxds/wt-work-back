/*
  Warnings:

  - A unique constraint covering the columns `[cpf]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cnpj]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "addressNumber" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "cnpj" TEXT,
ADD COLUMN     "corporateName" TEXT,
ADD COLUMN     "cpf" TEXT,
ADD COLUMN     "education" TEXT,
ADD COLUMN     "isActive" BOOLEAN DEFAULT true,
ADD COLUMN     "landlineAreaCode" TEXT,
ADD COLUMN     "landlineNumber" TEXT,
ADD COLUMN     "mobileAreaCode" TEXT,
ADD COLUMN     "mobileNumber" TEXT,
ADD COLUMN     "municipalRegistration" TEXT,
ADD COLUMN     "neighborhood" TEXT,
ADD COLUMN     "observations" TEXT,
ADD COLUMN     "personType" TEXT DEFAULT 'FISICA',
ADD COLUMN     "registrationNumber" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "stateRegistration" TEXT,
ADD COLUMN     "zipCode" TEXT;

-- CreateTable
CREATE TABLE "_InstructorTrainings" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_InstructorTrainings_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_InstructorTrainings_B_index" ON "_InstructorTrainings"("B");

-- CreateIndex
CREATE UNIQUE INDEX "User_cpf_key" ON "User"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "User_cnpj_key" ON "User"("cnpj");

-- CreateIndex
CREATE INDEX "User_cpf_idx" ON "User"("cpf");

-- CreateIndex
CREATE INDEX "User_cnpj_idx" ON "User"("cnpj");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- AddForeignKey
ALTER TABLE "_InstructorTrainings" ADD CONSTRAINT "_InstructorTrainings_A_fkey" FOREIGN KEY ("A") REFERENCES "Training"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InstructorTrainings" ADD CONSTRAINT "_InstructorTrainings_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
