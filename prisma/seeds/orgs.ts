import { PlanTier } from '@prisma/client';

export const orgs = [
  {
    id: '1',
    name: 'Carriastic',
    slug: 'carr',
    planTier: PlanTier.STANDARD,
    planSlug: 'standard',
    seatLimit: 3,
    resumeAllotment: 1000,
    creditsBalance: 1500,
    billingEmail: 'carriastic@gmail.com',
  },
];
