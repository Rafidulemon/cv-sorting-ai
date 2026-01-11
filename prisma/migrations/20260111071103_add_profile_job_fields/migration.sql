-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "cvAnalyzedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cvSortedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastActivityAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profileStatus" TEXT,
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "team" TEXT,
ADD COLUMN     "timezone" TEXT,
ADD COLUMN     "title" TEXT;
