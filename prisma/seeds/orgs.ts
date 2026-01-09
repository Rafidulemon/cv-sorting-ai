import { PlanTier } from '@prisma/client';

export const orgs = [
  {
    id: '1',
    name: 'Carriastic',
    slug: 'carr',
    planTier: PlanTier.STANDARD,
    seatLimit: 10,
    resumeAllotment: 500,
    creditsBalance: 0,
    billingEmail: 'carriastic@gmail.com',
  },
];
