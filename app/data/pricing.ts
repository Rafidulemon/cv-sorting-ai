export type PricingPlan = {
  slug: string;
  name: string;
  description: string;
  price: number;
  period: string;
  cta: string;
  highlight?: boolean;
  features: string[];
  topUp: number;
  monthlyCredits: number;
  approxCvs: string;
  activeJobs: string;
  team: number;
  support: string;
  apiAccess: boolean;
  askAi: boolean;
  aiJd: boolean;
  ocr: string;
  semanticSearch: boolean;
  sortOrder?: number;
  creditBundles?: CreditBundle[];
};

export type CreditUsageRow = {
  action: string;
  credits: string;
};

export type FreePlanNudge = {
  headline: string;
  bullets: string[];
  banner: string;
};

export type CreditBundle = {
  id?: string;
  name: string;
  credits: number;
  isPopular?: boolean;
  sortOrder?: number;
};

const defaultCreditBundles: CreditBundle[] = [
  {
    name: "Starter boost",
    credits: 250,
    isPopular: false,
  },
  {
    name: "Growth",
    credits: 750,
    isPopular: true,
  },
  {
    name: "Scale",
    credits: 2000,
    isPopular: false,
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    slug: "free",
    name: "Free",
    description: "For quick testing and product discovery.",
    price: 0,
    period: "per month",
    cta: "Try for Free",
    features: [
      "10 credits / month — ~6 CVs",
      "1 active job",
      "Basic AI reasoning",
      "Top-up: BDT 200 per 100 credits",
    ],
    topUp: 200,
    monthlyCredits: 10,
    approxCvs: "~6",
    activeJobs: "1",
    team: 1,
    support: "Basic",
    apiAccess: false,
    askAi: false,
    aiJd: false,
    ocr: "No",
    semanticSearch: false,
    creditBundles: defaultCreditBundles,
  },
  {
    slug: "standard",
    name: "Standard",
    description: "For startups, SMEs, and recruitment teams.",
    price: 7500,
    period: "per month (BDT 9,000 month-to-month)",
    cta: "Choose Standard",
    highlight: true,
    features: [
      "1,500 credits / month — ~1,000 CVs",
      "Up to 15 active jobs",
      "AI CV scoring + explanation",
      "Ask AI about this CV",
      "AI Job Description creation",
      "OCR support (quota-based)",
      "Semantic search",
      "Up to 5 team members",
      "Priority support",
      "Top-up: BDT 125 per 100 credits",
    ],
    topUp: 125,
    monthlyCredits: 1500,
    approxCvs: "~1,000",
    activeJobs: "Up to 15",
    team: 5,
    support: "Priority",
    apiAccess: false,
    askAi: true,
    aiJd: true,
    ocr: "Quota-based",
    semanticSearch: true,
    creditBundles: defaultCreditBundles,
  },
  {
    slug: "premium",
    name: "Premium",
    description: "For high-volume and advanced hiring.",
    price: 15000,
    period: "per month (BDT 18,000 month-to-month)",
    cta: "Upgrade to Premium",
    features: [
      "3,500 credits / month — ~2,300 CVs",
      "Unlimited jobs",
      "Advanced AI reasoning",
      "Unlimited Ask-AI (fair use)",
      "High-volume OCR",
      "API access",
      "Up to 10 team members",
      "SLA & priority support",
      "Top-up: BDT 100 per 100 credits",
    ],
    topUp: 100,
    monthlyCredits: 3500,
    approxCvs: "~2,300",
    activeJobs: "Unlimited",
    team: 10,
    support: "SLA + priority",
    apiAccess: true,
    askAi: true,
    aiJd: true,
    ocr: "High-volume",
    semanticSearch: true,
    creditBundles: defaultCreditBundles,
  },
];

export const creditUsageRows: CreditUsageRow[] = [
  { action: "Full CV processing", credits: "1.5" },
  { action: "Ask AI about CV", credits: "1" },
  { action: "AI Job Description", credits: "2" },
  { action: "OCR (scanned CV)", credits: "1" },
];

export const creditBundles: CreditBundle[] = [
  ...defaultCreditBundles,
];

export const freePlanNudge: FreePlanNudge = {
  headline: "Enough to fully analyze ~6 CVs — perfect for activation",
  bullets: [
    "Practically zero infra + AI cost while preventing abuse.",
    "Forces value realization quickly and pushes a clean upgrade funnel.",
    "Strong pressure to Standard once users see the limit.",
  ],
  banner: "You have 10 credits — enough to fully analyze ~6 CVs.",
};
