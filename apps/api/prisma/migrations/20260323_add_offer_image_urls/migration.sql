-- AlterTable
ALTER TABLE "offers" ADD COLUMN "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];
