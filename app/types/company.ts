export type CompanyForm = {
  name: string;
  website: string;
  logo: string;
  domain: string;
  industry: string;
  size: string;
  region: string;
  hqLocation: string;
  billingEmail: string;
  companyEmail: string;
  phone: string;
  description: string;
};

export type CompanyMember = {
  id: string;
  userId: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
  status: string;
  isOwner?: boolean;
  createdAt?: string;
  lastActiveAt?: string;
};

export type CompanyDetailItem = {
  label: string;
  value?: string;
  helper?: string;
  isLink?: boolean;
  span?: boolean;
};

export type CompanyRoleOption = { label: string; value: string; disabled?: boolean };

export type CompanyPlanSnapshot = {
  name: string;
  renewal: string;
  seatLimit: number;
  creditBalance: number;
  currency: string;
  cvSortedTotal: number;
  cvSortedThisMonth: number;
  cvSortedTarget: number;
};

export type CompanyBarData = { label: string; value: number };
