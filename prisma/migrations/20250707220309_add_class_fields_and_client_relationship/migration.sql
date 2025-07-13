-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "clientId" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "observations" TEXT,
ADD COLUMN     "recycling" TEXT NOT NULL DEFAULT 'NÃO',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'EM_ABERTO',
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'CURSO';

-- CreateIndex
CREATE INDEX "Class_clientId_idx" ON "Class"("clientId");

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
