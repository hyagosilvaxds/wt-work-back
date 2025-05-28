/*
  Warnings:

  - You are about to drop the column `cpf` on the `Organizador` table. All the data in the column will be lost.
  - Added the required column `doc` to the `Organizador` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Organizador" DROP COLUMN "cpf",
ADD COLUMN     "doc" TEXT NOT NULL;
