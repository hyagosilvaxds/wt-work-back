/*
  Warnings:

  - You are about to drop the column `roomId` on the `Class` table. All the data in the column will be lost.
  - You are about to drop the `Room` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Class" DROP CONSTRAINT "Class_roomId_fkey";

-- AlterTable
ALTER TABLE "Class" DROP COLUMN "roomId";

-- DropTable
DROP TABLE "Room";
