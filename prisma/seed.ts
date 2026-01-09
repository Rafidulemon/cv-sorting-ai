import { MembershipStatus, OrgRole, PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { orgs } from './seeds/orgs';
import { users } from './seeds/users';

const prisma = new PrismaClient();

const hashPassword = (password: string) => bcrypt.hash(password, 10);

async function main() {
  for (const org of orgs) {
    await prisma.organization.upsert({
      where: { id: org.id },
      update: {
        name: org.name,
        slug: org.slug,
        planTier: org.planTier,
        seatLimit: org.seatLimit,
        resumeAllotment: org.resumeAllotment,
        creditsBalance: org.creditsBalance,
        billingEmail: org.billingEmail,
      },
      create: {
        ...org,
      },
    });
  }

  for (const user of users) {
    const passwordHash = await hashPassword(user.password);
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.firstName;

    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name,
        phone: user.phone,
        defaultOrgId: user.companyId,
        passwordHash,
      },
      create: {
        id: user.id,
        name,
        email: user.email,
        phone: user.phone,
        defaultOrgId: user.companyId,
        passwordHash,
      },
    });

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
        role: user.role as OrgRole,
        status: MembershipStatus.ACTIVE,
      },
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
