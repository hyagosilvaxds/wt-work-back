/*
  Warnings:

  - You are about to drop the column `pessoaId` on the `Doacao` table. All the data in the column will be lost.
  - You are about to drop the `Pessoa` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `descricaoCompleta` to the `Campanha` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imagem` to the `Campanha` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizadorId` to the `Campanha` table without a default value. This is not possible if the table is not empty.
  - Added the required column `doadorId` to the `Doacao` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Doacao" DROP CONSTRAINT "Doacao_pessoaId_fkey";

-- AlterTable
ALTER TABLE "Campanha" ADD COLUMN     "descricaoCompleta" TEXT NOT NULL,
ADD COLUMN     "imagem" TEXT NOT NULL,
ADD COLUMN     "organizadorId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Doacao" DROP COLUMN "pessoaId",
ADD COLUMN     "doadorId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Pessoa";

-- CreateTable
CREATE TABLE "Doador" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Doador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organizador" (
    "id" TEXT NOT NULL,
    "tipodeOrganizador" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organizador_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Campanha" ADD CONSTRAINT "Campanha_organizadorId_fkey" FOREIGN KEY ("organizadorId") REFERENCES "Organizador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doacao" ADD CONSTRAINT "Doacao_doadorId_fkey" FOREIGN KEY ("doadorId") REFERENCES "Doador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
