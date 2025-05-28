-- AlterTable
ALTER TABLE "Doacao" ADD COLUMN     "displayName" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "imgGenerationsCount" INTEGER DEFAULT 0,
ADD COLUMN     "profileImg" TEXT,
ADD COLUMN     "textGenerationsCount" INTEGER DEFAULT 0;
