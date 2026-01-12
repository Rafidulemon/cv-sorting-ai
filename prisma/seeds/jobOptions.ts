import { JobOptionCategory } from '@prisma/client';

type SeedOption = { value: string; label?: string; sortOrder?: number };

export const experienceLevelOptions: SeedOption[] = [
  { value: 'Entry level' },
  { value: 'Mid-level' },
  { value: 'Senior' },
  { value: 'Lead' },
  { value: 'Director' },
].map((option, index) => ({ ...option, sortOrder: index }));

export const employmentTypeOptions: SeedOption[] = [
  { value: 'FULL_TIME', label: 'Full time' },
  { value: 'PART_TIME', label: 'Part time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'TEMPORARY', label: 'Temporary' },
].map((option, index) => ({ ...option, sortOrder: index }));

export const currencyOptions: SeedOption[] = [
  { value: 'BDT', label: 'BDT (৳)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'YEN', label: 'YEN (¥)' },
].map((option, index) => ({ ...option, sortOrder: index }));

export const jobOptionSeeds: Array<{ category: JobOptionCategory; options: SeedOption[] }> = [
  { category: JobOptionCategory.EXPERIENCE_LEVEL, options: experienceLevelOptions },
  { category: JobOptionCategory.EMPLOYMENT_TYPE, options: employmentTypeOptions },
  { category: JobOptionCategory.CURRENCY, options: currencyOptions },
];
