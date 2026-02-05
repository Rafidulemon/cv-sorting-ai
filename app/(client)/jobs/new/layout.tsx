'use client';

import type { ReactNode } from 'react';
import { JobCreationProvider } from '@/app/components/job/JobCreationProvider';
import { JobCreationStatus } from '@/app/components/job/JobCreationStatus';
import { ResumeProcessingStatus } from '@/app/components/job/ResumeProcessingStatus';

export default function NewJobLayout({ children }: { children: ReactNode }) {
  return (
    <JobCreationProvider>
      {children}
      <JobCreationStatus />
      <ResumeProcessingStatus />
    </JobCreationProvider>
  );
}
