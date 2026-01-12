-- CreateEnum
CREATE TYPE "JobOptionCategory" AS ENUM ('EXPERIENCE_LEVEL', 'EMPLOYMENT_TYPE', 'CURRENCY');

-- CreateTable
CREATE TABLE "JobOption" (
    "id" TEXT NOT NULL,
    "category" "JobOptionCategory" NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobOption_category_sortOrder_idx" ON "JobOption"("category", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "JobOption_category_value_key" ON "JobOption"("category", "value");
