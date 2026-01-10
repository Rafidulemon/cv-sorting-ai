-- CreateTable
CREATE TABLE "PricingPlan" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "cta" TEXT NOT NULL,
    "highlight" BOOLEAN NOT NULL DEFAULT false,
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "topUp" TEXT NOT NULL,
    "monthlyCredits" INTEGER NOT NULL,
    "approxCvs" TEXT NOT NULL,
    "activeJobs" TEXT NOT NULL,
    "team" TEXT NOT NULL,
    "support" TEXT NOT NULL,
    "apiAccess" BOOLEAN NOT NULL DEFAULT false,
    "askAi" BOOLEAN NOT NULL DEFAULT false,
    "aiJd" BOOLEAN NOT NULL DEFAULT false,
    "ocr" TEXT NOT NULL DEFAULT 'No',
    "semanticSearch" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditUsage" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "credits" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreePlanNudge" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "headline" TEXT NOT NULL,
    "bullets" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "banner" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FreePlanNudge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PricingPlan_slug_key" ON "PricingPlan"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CreditUsage_action_key" ON "CreditUsage"("action");
