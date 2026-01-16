import {
  BillingCycle,
  CreditLedgerType,
  MembershipStatus,
  PlanTier,
  OrganizationStatus,
  PrismaClient,
  SubscriptionStatus,
  UserRole,
} from '@prisma/client';
import bcrypt from 'bcryptjs';
import { orgs } from './seeds/orgs';
import { users } from './seeds/users';
import { jobs } from './seeds/jobs';
import {
  pricingPlans as pricingPlanSeeds,
  creditUsageRows as creditUsageSeeds,
  freePlanNudge as freePlanNudgeSeed,
} from './seeds/pricing';
import { jobOptionSeeds } from './seeds/jobOptions';

const prisma = new PrismaClient();

const planDefaultsBySlug: Record<
  string,
  {
    label: string;
    monthlyCredits: number;
    approxCvAllowance: number;
    seatLimit: number;
    planTier: PlanTier;
  }
> = {
  free: {
    label: 'Free',
    monthlyCredits: 10,
    approxCvAllowance: 6,
    seatLimit: 1,
    planTier: PlanTier.FREEMIUM,
  },
  standard: {
    label: 'Standard',
    monthlyCredits: 1500,
    approxCvAllowance: 1000,
    seatLimit: 5,
    planTier: PlanTier.STANDARD,
  },
  premium: {
    label: 'Premium',
    monthlyCredits: 3500,
    approxCvAllowance: 2300,
    seatLimit: 10,
    planTier: PlanTier.ENTERPRISE,
  },
};

const hashPassword = (password: string) => bcrypt.hash(password, 10);

async function main() {
  // Pricing: plans, usage, and nudge
  for (const [index, plan] of pricingPlanSeeds.entries()) {
    await prisma.pricingPlan.upsert({
      where: { slug: plan.slug },
      update: {
        name: plan.name,
        description: plan.description,
        price: plan.price,
        period: plan.period,
        cta: plan.cta,
        highlight: Boolean(plan.highlight),
        features: plan.features,
        topUp: plan.topUp,
        monthlyCredits: plan.monthlyCredits,
        approxCvs: plan.approxCvs,
        activeJobs: plan.activeJobs,
        team: plan.team,
        support: plan.support,
        apiAccess: plan.apiAccess,
        askAi: plan.askAi,
        aiJd: plan.aiJd,
        ocr: plan.ocr,
        semanticSearch: plan.semanticSearch,
        sortOrder: index,
        creditBundles: plan.creditBundles ?? [],
      },
      create: {
        slug: plan.slug,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        period: plan.period,
        cta: plan.cta,
        highlight: Boolean(plan.highlight),
        features: plan.features,
        topUp: plan.topUp,
        monthlyCredits: plan.monthlyCredits,
        approxCvs: plan.approxCvs,
        activeJobs: plan.activeJobs,
        team: plan.team,
        support: plan.support,
        apiAccess: plan.apiAccess,
        askAi: plan.askAi,
        aiJd: plan.aiJd,
        ocr: plan.ocr,
        semanticSearch: plan.semanticSearch,
        sortOrder: index,
        creditBundles: plan.creditBundles ?? [],
      },
    });
  }
  await prisma.pricingPlan.deleteMany({
    where: { slug: { notIn: pricingPlanSeeds.map((plan) => plan.slug) } },
  });

  for (const row of creditUsageSeeds) {
    await prisma.creditUsage.upsert({
      where: { action: row.action },
      update: { credits: row.credits },
      create: { action: row.action, credits: row.credits },
    });
  }
  await prisma.creditUsage.deleteMany({
    where: { action: { notIn: creditUsageSeeds.map((item) => item.action) } },
  });

  await prisma.freePlanNudge.upsert({
    where: { id: 'default' },
    update: {
      headline: freePlanNudgeSeed.headline,
      bullets: freePlanNudgeSeed.bullets,
      banner: freePlanNudgeSeed.banner,
    },
    create: {
      id: 'default',
      headline: freePlanNudgeSeed.headline,
      bullets: freePlanNudgeSeed.bullets,
      banner: freePlanNudgeSeed.banner,
    },
  });

  for (const category of jobOptionSeeds) {
    for (const option of category.options) {
      await prisma.jobOption.upsert({
        where: {
          category_value: {
            category: category.category,
            value: option.value,
          },
        },
        update: {
          label: option.label ?? option.value,
          sortOrder: option.sortOrder ?? 0,
        },
        create: {
          category: category.category,
          value: option.value,
          label: option.label ?? option.value,
          sortOrder: option.sortOrder ?? 0,
        },
      });
    }
  }

  for (const user of users) {
    const passwordHash = await hashPassword(user.password);
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.firstName;

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name,
        phone: user.phone,
        designation: user.designation,
        team: user.team,
        timezone: user.timezone,
        profileStatus: user.profileStatus,
        startedAt: user.startedAt,
        defaultOrgId: null,
        passwordHash,
        image: user.image ?? '/images/default_dp.png',
        lastLoginAt: new Date(),
      },
      create: {
        id: user.id,
        name,
        email: user.email,
        phone: user.phone,
        designation: user.designation,
        team: user.team,
        timezone: user.timezone,
        profileStatus: user.profileStatus,
        startedAt: user.startedAt,
        defaultOrgId: null,
        passwordHash,
        image: user.image ?? '/images/default_dp.png',
        lastLoginAt: new Date(),
      },
    });
  }

  for (const org of orgs) {
    const planDetails = planDefaultsBySlug[org.planSlug] ?? planDefaultsBySlug.standard;
    const seatLimit = planDetails?.seatLimit ?? org.seatLimit;
    const resumeAllotment = planDetails?.approxCvAllowance ?? org.resumeAllotment;
    const creditsBalance = planDetails?.monthlyCredits ?? org.creditsBalance;
    const planTier = planDetails?.planTier ?? PlanTier.STANDARD;

    await prisma.organization.upsert({
      where: { id: org.id },
      update: {
        name: org.name,
        slug: org.slug,
        ownerId: org.ownerId,
        website: org.website,
        domain: org.domain,
        industry: org.industry,
        size: org.size,
        region: org.region,
        hqLocation: org.hqLocation,
        phone: org.phone,
        description: org.description,
        planTier,
        planSlug: org.planSlug,
        seatLimit,
        resumeAllotment,
        creditsBalance,
        billingEmail: org.billingEmail,
        companyEmail: org.billingEmail ?? null,
        status: OrganizationStatus.COMPLETED,
        logo: org.logo ?? '/logo/carriastic_logo.png',
      },
      create: {
        ...org,
        planTier,
        planSlug: org.planSlug,
        seatLimit,
        resumeAllotment,
        creditsBalance,
        companyEmail: org.billingEmail ?? null,
        status: OrganizationStatus.COMPLETED,
        logo: org.logo ?? '/logo/carriastic_logo.png',
      },
    });

    if (planDetails) {
      const renewsOn = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await prisma.organization.update({
        where: { id: org.id },
        data: {
          subscriptionStatus: SubscriptionStatus.ACTIVE,
          billingCycle: BillingCycle.MONTHLY,
          renewsOn,
          startsOn: new Date(),
        },
      });

      await prisma.creditLedger.upsert({
        where: { id: `ledger-plan-${org.id}` },
        update: {
          amount: planDetails.monthlyCredits,
          type: CreditLedgerType.ALLOTMENT,
          description: `${planDetails.label} monthly plan credit seed`,
        },
        create: {
          id: `ledger-plan-${org.id}`,
          organizationId: org.id,
          amount: planDetails.monthlyCredits,
          type: CreditLedgerType.ALLOTMENT,
          description: `${planDetails.label} monthly plan credit seed`,
        },
      });
    }
  }

  for (const user of users) {
    if (!user.companyId) {
      continue;
    }

    await prisma.user.update({
      where: { email: user.email },
      data: {
        defaultOrgId: user.companyId,
        role: user.role,
        profileStatus: MembershipStatus.ACTIVE,
        lastLoginAt: new Date(),
      },
    });
  }

  for (const job of jobs) {
    await prisma.job.upsert({
      where: { id: job.id },
      update: {
        organizationId: job.organizationId,
        createdById: job.createdById,
        title: job.title,
        status: job.status,
        sortingState: job.sortingState,
        cvSortedCount: job.cvSortedCount,
        cvAnalyzedCount: job.cvAnalyzedCount,
        lastActivityAt: job.lastActivityAt,
        publishedAt: job.publishedAt,
        updatedAt: job.updatedAt,
      },
      create: job,
    });
  }
}

main()
  .catch((error) => {
    console.error('Seed failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
