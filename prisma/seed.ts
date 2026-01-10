import {
  BillingCycle,
  CreditLedgerType,
  MembershipStatus,
  PlanTier,
  PrismaClient,
  SubscriptionStatus,
  UserRole,
} from '@prisma/client';
import bcrypt from 'bcryptjs';
import { orgs } from './seeds/orgs';
import { users } from './seeds/users';
import {
  pricingPlans as pricingPlanSeeds,
  creditUsageRows as creditUsageSeeds,
  freePlanNudge as freePlanNudgeSeed,
} from './seeds/pricing';

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

  for (const user of users) {
    const passwordHash = await hashPassword(user.password);
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.firstName;

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name,
        phone: user.phone,
        defaultOrgId: null,
        passwordHash,
        image: user.image ?? '/images/default_dp.png',
      },
      create: {
        id: user.id,
        name,
        email: user.email,
        phone: user.phone,
        defaultOrgId: null,
        passwordHash,
        image: user.image ?? '/images/default_dp.png',
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
        logo: org.logo ?? '/logo/carriastic_logo.png',
      },
      create: {
        ...org,
        planTier,
        planSlug: org.planSlug,
        seatLimit,
        resumeAllotment,
        creditsBalance,
        logo: org.logo ?? '/logo/carriastic_logo.png',
      },
    });

    if (planDetails) {
      const renewsOn = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await prisma.organizationSubscription.upsert({
        where: { id: `sub-${org.id}` },
        update: {
          plan: planTier,
          planSlug: org.planSlug,
          status: SubscriptionStatus.ACTIVE,
          billingCycle: BillingCycle.MONTHLY,
          seats: seatLimit,
          resumesIncluded: resumeAllotment,
          renewsOn,
        },
        create: {
          id: `sub-${org.id}`,
          organizationId: org.id,
          plan: planTier,
          planSlug: org.planSlug,
          status: SubscriptionStatus.ACTIVE,
          billingCycle: BillingCycle.MONTHLY,
          seats: seatLimit,
          resumesIncluded: resumeAllotment,
          renewsOn,
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

    await prisma.membership.upsert({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: user.companyId,
        },
      },
      update: {
        role: user.role,
        status: MembershipStatus.ACTIVE,
      },
      create: {
        userId: user.id,
        organizationId: user.companyId,
        role: user.role as UserRole,
        status: MembershipStatus.ACTIVE,
      },
    });

    await prisma.user.update({
      where: { email: user.email },
      data: { defaultOrgId: user.companyId },
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
