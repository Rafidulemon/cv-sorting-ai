import { PlanTier } from '@prisma/client';

export const orgs = [
  {
    id: '1',
    name: 'Carriastic',
    slug: 'carr',
    ownerId: '2',
    website: 'https://carrix.ai',
    logo: '/logo/carriastic_logo.png',
    domain: 'carrix.ai',
    industry: 'HR Tech · AI',
    size: '51-200',
    region: 'APAC',
    hqLocation: 'Dhaka, Bangladesh',
    planTier: PlanTier.STANDARD,
    planSlug: 'standard',
    seatLimit: 5,
    resumeAllotment: 1000,
    creditsBalance: 1500,
    billingEmail: 'billing@carrix.ai',
    phone: '+880 1700 123 456',
    description:
      'AI-first hiring suite powering resume scoring, shortlist recommendations, and recruiter workflows.',
  },
];
