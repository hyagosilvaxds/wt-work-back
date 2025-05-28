/*
  Warnings:

  - Added the required column `taxaPlataforma` to the `Doacao` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Campanha" ALTER COLUMN "status" SET DEFAULT 'pendente';

-- AlterTable
ALTER TABLE "Doacao" ADD COLUMN     "msgApoio" TEXT,
ADD COLUMN     "taxaPlataforma" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "Saques" (
    "id" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Saques_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Saques" ADD CONSTRAINT "Saques_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
