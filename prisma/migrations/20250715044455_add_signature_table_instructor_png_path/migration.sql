-- CreateTable
CREATE TABLE "Signature" (
    "id" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "pngPath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Signature_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Signature_instructorId_key" ON "Signature"("instructorId");

-- AddForeignKey
ALTER TABLE "Signature" ADD CONSTRAINT "Signature_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
