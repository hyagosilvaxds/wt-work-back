-- AlterTable
ALTER TABLE "Training" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "validityDays" INTEGER;
