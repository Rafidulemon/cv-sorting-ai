'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Briefcase, FileUp, Sparkles } from 'lucide-react';
import type { JobSummary } from '../data';
import { jobs, jobDetails } from '../data';
import { useSession } from 'next-auth/react';

type SelectedJob = {
  id: string | null;
  title: string;
  status?: JobSummary['status'];
  owner?: string;
  updated?: string;
};

export default function NextStepPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const currentUserName = session?.user?.name?.trim() || 'You';

  const prefilledJobId = searchParams.get('jobId') ?? '';
  const prefilledJobTitle = searchParams.get('title') ?? '';

  const prefilledJob = useMemo<SelectedJob | null>(() => {
    if (!prefilledJobId && !prefilledJobTitle) return null;
    const knownJob = prefilledJobId ? jobDetails[prefilledJobId] ?? jobs.find((job) => job.id === prefilledJobId) : null;
    if (knownJob) {
      return {
        id: knownJob.id,
        title: knownJob.title,
        status: knownJob.status,
        owner: knownJob.owner,
        updated: knownJob.updated,
      };
    }
    return {
      id: prefilledJobId || null,
      title: prefilledJobTitle || 'Untitled role',
      status: prefilledJobId ? 'Draft' : undefined,
    };
  }, [prefilledJobId, prefilledJobTitle]);

  const [selectedJobId, setSelectedJobId] = useState(prefilledJob?.id ?? '');
  const [selectedJobTitle, setSelectedJobTitle] = useState(prefilledJob?.title ?? '');

  const selectedJob = useMemo<SelectedJob | null>(() => {
    if (selectedJobId) {
      const knownJob = jobDetails[selectedJobId] ?? jobs.find((job) => job.id === selectedJobId);
      if (knownJob) {
        return {
          id: knownJob.id,
          title: knownJob.title,
          status: knownJob.status,
          owner: knownJob.owner,
          updated: knownJob.updated,
        };
      }
    }

    if (selectedJobId || selectedJobTitle) {
      return {
        id: selectedJobId || null,
        title: selectedJobTitle || 'Untitled role',
        status: selectedJobId ? 'Draft' : undefined,
      };
    }

    return null;
  }, [selectedJobId, selectedJobTitle]);

  const handleProceedToUploads = () => {
    if (!selectedJob) return;
    const params = new URLSearchParams();
    if (selectedJob.id) {
      params.set('jobId', selectedJob.id);
    }
    if (selectedJob.title) {
      params.set('title', selectedJob.title);
    }
    const query = params.toString();
    router.push(`/jobs/new/upload${query ? `?${query}` : ''}`);
  };

  return (
    <div className="space-y-8 text-[#181B31]">
      <section className="relative overflow-hidden rounded-4xl border border-[#DCE0E0]/80 bg-gradient-to-br from-[#FFFFFF] via-[#F2F4F8] to-[#FFFFFF] p-8 shadow-card-soft">
        <div className="pointer-events-none absolute inset-0 opacity-80">
          <div className="absolute -top-24 right-8 h-48 w-48 rounded-full bg-[#3D64FF]/12 blur-3xl" />
          <div className="absolute -bottom-16 left-10 h-48 w-48 rounded-full bg-[#3D64FF]/10 blur-3xl" />
        </div>
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 rounded-full border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#3D64FF] transition hover:border-[#3D64FF]/60 hover:bg-[#3D64FF]/20"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to jobs
            </Link>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">
              <Sparkles className="h-4 w-4 text-[#3D64FF]" />
              Next step
            </div>
            <h1 className="text-3xl font-semibold leading-tight text-[#181B31] lg:text-4xl">Upload candidates</h1>
            <p className="max-w-2xl text-sm text-[#4B5563] lg:text-base">
              Move to uploads once your description and role details feel complete. You can toggle back without losing any
              progress. We&apos;ll carry your job context into candidate intake and ranking.
            </p>
          </div>
          <div className="rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF]/90 p-5 text-sm text-[#4B5563] shadow-card-soft lg:w-[360px]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">Selected job</p>
            {selectedJob ? (
              <div className="mt-3 space-y-2">
                <p className="text-base font-semibold text-[#181B31]">{selectedJob.title}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B7280]">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#F5F7FB] px-3 py-1 font-semibold text-[#1F2A44]">
                    <Briefcase className="h-3.5 w-3.5 text-[#3D64FF]" />
                    ID {selectedJob.id ?? 'TBD'}
                  </span>
                  {selectedJob.status && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#E8F2FF] px-3 py-1 font-semibold text-[#1C64F2]">
                      {selectedJob.status}
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#8A94A6]">
                  <p>Created by {selectedJob.owner ?? currentUserName}</p>
                  <p>Updated {selectedJob.updated ?? 'Just now'}</p>
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-dashed border-[#DCE0E0] bg-[#F7F9FC] p-4 text-xs text-[#8A94A6]">
                No job selected yet. Choose a recent job to carry its context into uploads.
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileUp className="h-5 w-5 text-[#3D64FF]" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">Candidate uploads</p>
                <h2 className="text-lg font-semibold text-[#181B31]">Send CVs to this role</h2>
              </div>
            </div>
            <Link
              href="/jobs/new"
              className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#F5F7FB] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#181B31] transition hover:border-[#3D64FF]/40 hover:bg-[#F0F2F8]"
            >
              Edit description
            </Link>
          </div>
          <p className="mt-2 text-sm text-[#4B5563]">
            We&apos;ll sync your selected job into the upload flow so you can drag in CVs, connect drive links, and kick off
            the shortlist. You can always hop back to refine the JD.
          </p>
          <div className="mt-5 rounded-3xl border border-[#DCE0E0] bg-gradient-to-r from-[#F5F7FB] via-[#FFFFFF] to-[#F5F7FB] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A94A6]">Ready to continue</p>
                <p className="text-base font-semibold text-[#181B31]">
                  {selectedJob ? 'Carry this job into candidate intake' : 'Pick a job to enable uploads'}
                </p>
                <p className="text-sm text-[#4B5563]">
                  We keep your progress — hop into uploads, then return here to adjust screening factors.
                </p>
              </div>
              <button
                type="button"
                onClick={handleProceedToUploads}
                disabled={!selectedJob}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                  selectedJob
                    ? 'border border-[#3D64FF]/50 bg-[#3D64FF]/15 text-[#3D64FF] shadow-glow-primary hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/25'
                    : 'cursor-not-allowed border border-[#DCE0E0] bg-[#F5F7FB] text-[#8A94A6]'
                }`}
              >
                Go to uploads
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft">
          <div className="flex items-center gap-3">
            <Briefcase className="h-5 w-5 text-[#3D64FF]" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">Choose job</p>
              <h2 className="text-lg font-semibold text-[#181B31]">Select where to upload</h2>
            </div>
          </div>
          <p className="text-sm text-[#4B5563]">
            Arriving directly? Pick the job that should receive the next batch of CVs. We&apos;ll surface its ID and status
            above.
          </p>
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A94A6]">Recent jobs</label>
            <select
              value={selectedJobId}
              onChange={(event) => {
                const nextId = event.target.value;
                setSelectedJobId(nextId);
                const found = jobs.find((job) => job.id === nextId);
                setSelectedJobTitle(found?.title ?? '');
              }}
              className="w-full rounded-2xl border border-[#DCE0E0] bg-[#F7F9FC] px-4 py-3 text-sm text-[#181B31] focus:border-[#3D64FF]/60 focus:outline-none"
            >
              <option value="">Select a job</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} — {job.status}
                </option>
              ))}
            </select>
            {prefilledJob && (
              <div className="rounded-2xl border border-[#DCE0E0] bg-[#F9FAFB] p-4 text-xs text-[#4B5563]">
                <p className="font-semibold text-[#181B31]">From builder</p>
                <p className="mt-1">
                  We detected <span className="font-semibold">{prefilledJob.title}</span>
                  {prefilledJob.id ? ` (ID ${prefilledJob.id})` : ''}. Keep it selected or choose a different job.
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-[#8A94A6]">
              Need a new role? Start a fresh draft and come back here to upload.
            </div>
            <Link
              href="/jobs/new"
              className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#F5F7FB] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#181B31] transition hover:border-[#3D64FF]/40 hover:bg-[#F0F2F8]"
            >
              Create another job
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
