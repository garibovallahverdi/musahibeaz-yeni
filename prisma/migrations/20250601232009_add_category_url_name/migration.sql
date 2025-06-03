/*
  Warnings:

  - A unique constraint covering the columns `[urlName]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "urlName" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Category_urlName_key" ON "Category"("urlName");
