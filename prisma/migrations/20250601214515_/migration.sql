/*
  Warnings:

  - You are about to drop the column `linkName` on the `Category` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Category" DROP COLUMN "linkName",
ADD COLUMN     "urlName" TEXT NOT NULL DEFAULT 'none';
