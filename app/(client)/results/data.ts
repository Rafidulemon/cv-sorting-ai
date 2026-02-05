import type { Candidate } from '@/app/types';

export type CandidateStage = 'shortlist' | 'hold' | 'rejected';

export type CandidateResult = Candidate & {
  stage: CandidateStage;
  experience: string;
  summary: string;
  cvText: string;
};

export const stageMeta: Record<CandidateStage, { label: string; className: string }> = {
  shortlist: { label: 'Shortlisted', className: 'bg-[#E6F4EA] text-[#1B806A]' },
  hold: { label: 'On hold', className: 'bg-[#FFF5E5] text-[#9A5B00]' },
  rejected: { label: 'Rejected', className: 'bg-[#FEE2E2] text-[#B91C1C]' },
};
