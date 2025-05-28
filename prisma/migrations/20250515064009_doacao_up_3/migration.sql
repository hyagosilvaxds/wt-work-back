/*
  Warnings:

  - You are about to drop the column `msgApoio` on the `Doacao` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Doacao" DROP COLUMN "msgApoio";

-- AlterTable
ALTER TABLE "Doador" ADD COLUMN     "msgApoio" TEXT;
