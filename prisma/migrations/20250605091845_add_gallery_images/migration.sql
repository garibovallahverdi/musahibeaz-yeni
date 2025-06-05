-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "galleryImages" TEXT[] DEFAULT ARRAY[]::TEXT[];
