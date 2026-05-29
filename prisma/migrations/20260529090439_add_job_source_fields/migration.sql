-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "source" TEXT DEFAULT 'manual';

