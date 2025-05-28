/*
  Warnings:

  - Added the required column `metodoPagamento` to the `Doacao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Doacao" ADD COLUMN     "metodoPagamento" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pendente';
