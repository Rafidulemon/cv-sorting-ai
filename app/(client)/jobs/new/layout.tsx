'use client';

import type { ReactNode } from 'react';
import { JobCreationProvider } from '@/app/components/job/JobCreationProvider';
import { JobCreationStatus } from '@/app/components/job/JobCreationStatus';

export default function NewJobLayout({ children }: { children: ReactNode }) {
  return (
    <JobCreationProvider>
      {children}
      <JobCreationStatus />
    </JobCreationProvider>
  );
}
