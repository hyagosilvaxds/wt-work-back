/*
  Warnings:

  - Added the required column `chavePIX` to the `Saques` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nomeCompleto` to the `Saques` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Saques" ADD COLUMN     "chavePIX" TEXT NOT NULL,
ADD COLUMN     "nomeCompleto" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pendente';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "saldo" DOUBLE PRECISION NOT NULL DEFAULT 0;
