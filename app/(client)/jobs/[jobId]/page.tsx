'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  FileText,
  Loader2,
  MapPin,
  RotateCcw,
  Sparkles,
  Star,
  UploadCloud,
  UserRound,
} from 'lucide-react';
import type { SortingState } from '../data';
import { mapJobToDetail, type ApiJob, type JobDetail } from '../data';
import type { CandidateResult } from '../../results/data';
import { stageMeta } from '../../results/data';

const sortingTone: Record<SortingState, { label: string; className: string; helper: string }> = {
  NOT_STARTED: {
    label: 'Needs sorting',
    className: 'bg-[#FFF5E5] text-[#9A5B00]',
    helper: 'No sorting run yet. Kick off the first pass to get a shortlist.',
  },
  PROCESSING: {
    label: 'Processing',
    className: 'bg-[#FEF3C7] text-[#92400E]',
    helper: 'Sorting in progress. We will refresh results once complete.',
  },
  COMPLETED: {
    label: 'Sorted',
    className: 'bg-[#E6F4EA] text-[#1B806A]',
    helper: 'Last run complete. Rerun anytime with new CVs or updated criteria.',
  },
};

type ResumeFile = {
  resumeId: string;
  fileId: string | null;
  name: string;
  status: string;
  mimeType: string | null;
  size: number | null;
};

const resumeTone: Record<string, { label: string; className: string }> = {
  COMPLETED: { label: 'Parsed', className: 'bg-[#E6F4EA] text-[#1B806A]' },
  SCORING: { label: 'Scoring', className: 'bg-[#FEF3C7] text-[#92400E]' },
  EMBEDDING: { label: 'Embedding', className: 'bg-[#FEF3C7] text-[#92400E]' },
  PARSING: { label: 'Parsing', className: 'bg-[#FEF3C7] text-[#92400E]' },
  UPLOADED: { label: 'Uploaded', className: 'bg-[#E8F2FF] text-[#1C64F2]' },
  FAILED: { label: 'Failed', className: 'bg-[#FEE2E2] text-[#B91C1C]' },
};

const formatBytes = (value?: number | null) => {
  if (!value || value <= 0) return '—';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};

const sanitizeHtmlLightly = (html?: string | null) => {
  if (!html) return null;
  return html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '').replace(/on\w+=(?:"[^"]*"|'[^']*')/gi, '');
};

export default function JobDetailPage() {
  const router = useRouter();
  const pathname = usePathname();

  const jobId = useMemo(() => pathname?.split('/').filter(Boolean).pop() ?? '', [pathname]);
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortingState, setSortingState] = useState<SortingState>('NOT_STARTED');
  const [lastSorted, setLastSorted] = useState<string | null>(null);
  const [runCount, setRunCount] = useState(0);
  const [isKickingOff, setIsKickingOff] = useState(false);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [queueJobId, setQueueJobId] = useState<string | null>(null);
  const [resumeFiles, setResumeFiles] = useState<ResumeFile[]>([]);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<CandidateResult[]>([]);
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [shortlistSize, setShortlistSize] = useState<number | null>(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState<string | null>(null);

  useEffect(() => {
    const loadJob = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch('/api/jobs', { cache: 'no-store' });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error ?? 'Failed to load job');
        }
        const apiJobs = Array.isArray(payload?.jobs) ? (payload.jobs as ApiJob[]) : [];
        const match = apiJobs.find((item) => item.id === jobId);
        if (!match) {
          setError('Job not found');
          return;
        }
        const detail = mapJobToDetail(match);
        setJob(detail);
        setSortingState(detail.sortingState);
        setLastSorted(detail.lastSorted ?? null);
        const runs = match.sortingRuns ?? (match.sortingState === 'COMPLETED' ? 1 : 0);
        setRunCount(runs);
      } catch (err) {
        const message = (err as Error)?.message ?? 'Failed to load job';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [jobId, router]);

  useEffect(() => {
    if (!job) return;
    setSortingState(job.sortingState);
    setLastSorted(job.lastSorted ?? null);
    setIsKickingOff(false);
  }, [job]);

  useEffect(() => {
    setResumeFiles([]);
    setCandidates([]);
    setRequiredSkills([]);
    setShortlistSize(null);
    setResumeError(null);
    setResultsError(null);
  }, [jobId]);

  useEffect(() => {
    if (!jobId) return;
    const controller = new AbortController();
    const loadResumes = async () => {
      try {
        setResumeLoading(true);
        setResumeError(null);
        const response = await fetch(`/api/jobs/${encodeURIComponent(jobId)}/resumes`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error ?? 'Failed to load CVs');
        }
        const files = Array.isArray(payload?.files) ? (payload.files as ResumeFile[]) : [];
        setResumeFiles(files);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        const message = (err as Error)?.message ?? 'Failed to load CVs';
        setResumeError(message);
      } finally {
        setResumeLoading(false);
      }
    };
    loadResumes();
    return () => controller.abort();
  }, [jobId]);

  useEffect(() => {
    if (!jobId || sortingState !== 'COMPLETED') return;
    const controller = new AbortController();
    const loadResults = async () => {
      try {
        setResultsLoading(true);
        setResultsError(null);
        const response = await fetch(`/api/jobs/${encodeURIComponent(jobId)}/results`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error ?? 'Failed to load results');
        }
        const rows = Array.isArray(payload?.candidates) ? (payload.candidates as CandidateResult[]) : [];
        setCandidates(rows);
        setRequiredSkills(Array.isArray(payload?.requiredSkills) ? payload.requiredSkills : []);
        setShortlistSize(
          typeof payload?.shortlistSize === 'number' ? (payload.shortlistSize as number) : null,
        );
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        const message = (err as Error)?.message ?? 'Failed to load results';
        setResultsError(message);
      } finally {
        setResultsLoading(false);
      }
    };
    loadResults();
    return () => controller.abort();
  }, [jobId, sortingState]);

  const stopSortingPoll = useCallback(() => {
    if (pollRef.current) {
      clearTimeout(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const pollSortingStatus = useCallback(
    (queueId?: string | null) => {
      stopSortingPoll();
      const poll = async () => {
        try {
          const query = queueId ? `?queueJobId=${encodeURIComponent(queueId)}` : '';
          const response = await fetch(`/api/jobs/${jobId}/sort${query}`, { cache: 'no-store' });
          if (response.ok) {
            const payload = await response.json();
            const state = (payload?.sortingState as SortingState | undefined) ?? 'NOT_STARTED';
            setSortingState(state);
            if (state === 'COMPLETED') {
              setIsKickingOff(false);
              setLastSorted('Just now');
              setRunCount((prev) => prev + 1);
              stopSortingPoll();
              return;
            }
          }
        } catch (err) {
          console.warn('Failed to poll sorting state', err);
        }
        pollRef.current = setTimeout(poll, 2000);
      };
      poll();
    },
    [jobId, stopSortingPoll],
  );

  useEffect(() => {
    return () => {
      stopSortingPoll();
    };
  }, [stopSortingPoll]);

  useEffect(() => {
    if (sortingState === 'PROCESSING') {
      pollSortingStatus(queueJobId);
    }
  }, [sortingState, pollSortingStatus, queueJobId]);

  const sortedCandidates = useMemo(
    () => [...candidates].sort((a, b) => b.matchScore - a.matchScore),
    [candidates],
  );

  const shortlistCandidates = useMemo(
    () => sortedCandidates.filter((candidate) => candidate.stage === 'shortlist'),
    [sortedCandidates],
  );

  const shortlistedCount = shortlistCandidates.length;
  const holdCount = sortedCandidates.filter((candidate) => candidate.stage === 'hold').length;
  const topCandidate = shortlistCandidates[0];
  const averageScore =
    shortlistedCount === 0
      ? null
      : Math.round(shortlistCandidates.reduce((acc, candidate) => acc + candidate.matchScore, 0) / shortlistedCount);

  const coverage =
    shortlistedCount === 0 || requiredSkills.length === 0
      ? null
      : Math.round(
          (shortlistCandidates.reduce((acc, candidate) => {
            const present = candidate.skillGap.present.filter((skill) =>
              requiredSkills.some((req) => req.toLowerCase() === skill.toLowerCase()),
            ).length;
            return acc + present / requiredSkills.length;
          }, 0) /
            shortlistedCount) *
            100,
        );

  const uploadHref = job
    ? `/jobs/new/upload?jobId=${encodeURIComponent(job.id)}&title=${encodeURIComponent(job.title)}`
    : '/jobs/new/upload';

  const descriptionHtml = useMemo(() => sanitizeHtmlLightly(job?.description ?? null), [job?.description]);
  const hasDescription = Boolean(descriptionHtml && descriptionHtml.trim().length);

  const resumeCompletedCount = resumeFiles.filter((file) => file.status === 'COMPLETED').length;
  const uploadedCount = resumeFiles.length || job?.candidates || 0;
  const processedCount = resumeCompletedCount || job?.candidates || 0;

  if (loading) {
    return (
      <div className="space-y-4 rounded-3xl border border-[#E5E7EB] bg-white p-6 text-sm text-[#4B5563] shadow-card-soft">
        Loading job details...
      </div>
    );
  }

  if (!job || error) {
    return (
      <div className="space-y-4 rounded-3xl border border-[#F59E0B] bg-[#FFF7E6] p-6 text-sm text-[#92400E] shadow-card-soft">
        {error || 'Job not found'}
        <div>
          <Link href="/jobs" className="text-[#3D64FF] underline">
            Back to jobs
          </Link>
        </div>
      </div>
    );
  }

  const statusTone =
    job.status === 'Active'
      ? 'bg-[#E8F2FF] text-[#1C64F2]'
      : job.status === 'Draft'
        ? 'bg-[#FFF5E5] text-[#A26B00]'
        : job.status === 'Reviewing'
          ? 'bg-[#E9E5FF] text-[#5B32D2]'
          : 'bg-[#E6F4EA] text-[#1B806A]';

  const canViewResults = sortingState === 'COMPLETED';
  const disableStart = isKickingOff || sortingState === 'PROCESSING';

  const startSorting = async () => {
    if (disableStart) return;
    setIsKickingOff(true);
    setError('');
    setResultsError(null);
    setCandidates([]);
    setShortlistSize(null);
    try {
      const response = await fetch(`/api/jobs/${jobId}/sort`, { method: 'POST' });
      const payload = await response.json();
      if (!response.ok) {
        const message = payload?.error ?? 'Failed to start sorting';
        throw new Error(message);
      }
      setSortingState('PROCESSING');
      const queuedId = (payload?.queueJobId as string | undefined) ?? null;
      setQueueJobId(queuedId);
      pollSortingStatus(queuedId);
    } catch (err) {
      const message = (err as Error)?.message ?? 'Failed to start sorting';
      setError(message);
      setSortingState('NOT_STARTED');
      setIsKickingOff(false);
    }
  };

  return (
    <div className="space-y-8 text-[#0F172A]">
      <section className="relative overflow-hidden rounded-4xl border border-[#E5E7EB] bg-gradient-to-r from-white via-[#F7F9FC] to-white px-6 py-6 shadow-card-soft">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -top-20 right-6 h-40 w-40 rounded-full bg-[#3D64FF]/12 blur-3xl" />
          <div className="absolute -bottom-24 left-10 h-44 w-44 rounded-full bg-[#A78BFA]/12 blur-3xl" />
        </div>
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8A94A6] transition hover:text-[#3D64FF]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to jobs
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold leading-tight text-[#0F172A]">{job.title}</h1>
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusTone}`}>
                <span className="h-2 w-2 rounded-full bg-current" />
                {job.status}
              </span>
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${sortingTone[sortingState].className}`}
              >
                <span className="h-2 w-2 rounded-full bg-current" />
                {sortingTone[sortingState].label}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#E5EAFE] px-3 py-1 text-xs font-semibold text-[#3D64FF]">
                {runCount || 0} {runCount === 1 ? 'run' : 'runs'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-[#475569]">
              <span className="inline-flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-[#3D64FF]" />
                Created {job.created}
              </span>
              <span className="inline-flex items-center gap-2">
                <UserRound className="h-4 w-4 text-[#3D64FF]" />
                Owner {job.owner}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#3D64FF]" />
                {job.location ?? 'Location TBD'}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-[#3D64FF]" />
                {lastSorted ? `Last sorted ${lastSorted}` : 'No run yet'}
              </span>
            </div>
            <p className="text-sm text-[#6B7280]">{sortingTone[sortingState].helper}</p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={uploadHref}
                className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#FFFFFF] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#0F172A] transition hover:border-[#3D64FF]/50 hover:bg-[#F1F5FF]"
              >
                <UploadCloud className="h-4 w-4 text-[#3D64FF]" />
                Upload CVs
              </Link>
              <button
                type="button"
                onClick={startSorting}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                  disableStart
                    ? 'cursor-not-allowed border border-[#E5E7EB] bg-[#F5F7FB] text-[#8A94A6]'
                    : 'border border-[#3D64FF]/40 bg-[#3D64FF]/15 text-[#3D64FF] shadow-glow-primary hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/25'
                }`}
                disabled={disableStart}
              >
                {sortingState === 'COMPLETED' ? <RotateCcw className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                {sortingState === 'COMPLETED' ? 'Rerun sorting' : sortingState === 'PROCESSING' ? 'Sorting...' : 'Start CV sorting'}
                {(isKickingOff || sortingState === 'PROCESSING') && <Loader2 className="h-4 w-4 animate-spin" />}
              </button>
              {canViewResults ? (
                <Link
                  href={`/results/${job.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-[#3D64FF] transition hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/25"
                >
                  View results
                  <Sparkles className="h-4 w-4" />
                </Link>
              ) : (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#F5F7FB] px-5 py-2 text-xs font-semibold uppercase tracking-wide text-[#8A94A6]"
                  disabled
                >
                  Results after sorting
                </button>
              )}
            </div>
            {topCandidate && (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#E5E7EB] bg-white/80 px-4 py-3 shadow-inner">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A94A6]">Top match</p>
                  <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#0F172A]">
                    <span>{topCandidate.name}</span>
                    <span className="rounded-full bg-[#E6F4EA] px-2 py-1 text-xs font-semibold text-[#1B806A]">
                      {topCandidate.matchScore}% match
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280]">
                    {topCandidate.experience || 'Experience pending'} · {(topCandidate.matchedSkills || []).slice(0, 3).join(' · ')}
                  </p>
                </div>
                <Link
                  href={`/results/${job.id}/candidates/${topCandidate.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-[#3D64FF]/30 bg-[#3D64FF]/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#3D64FF] transition hover:border-[#3D64FF]/60 hover:bg-[#3D64FF]/20"
                >
                  Review match
                  <Sparkles className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <section className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-card-soft">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-[#3D64FF]" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A94A6]">Job description</p>
                <h2 className="text-lg font-semibold text-[#0F172A]">What candidates will see</h2>
              </div>
            </div>
            <span className="text-xs text-[#8A94A6]">Updated {job.updated}</span>
          </div>
          {hasDescription ? (
            <div
              className="mt-4 space-y-3 text-sm leading-relaxed text-[#1F2937]"
              dangerouslySetInnerHTML={{ __html: descriptionHtml ?? '' }}
            />
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-[#DCE0E0] bg-[#F7F9FC] p-4 text-sm text-[#6B7280]">
              No description has been added yet. Add one from the job editor so reviewers can see the full context.
            </div>
          )}
          <div className="mt-5 space-y-2 rounded-2xl border border-[#F0F2F5] bg-[#F9FAFB]/70 p-4">
            {job.requirements?.length ? (
              job.requirements.map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm text-[#1F2A44]">
                  <BadgeCheck className="mt-1 h-4 w-4 text-[#3D64FF]" />
                  <span>{item}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#6B7280]">No requirements parsed yet.</p>
            )}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#EEF2F7] bg-[#F9FAFB] p-3 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A94A6]">Location</p>
              <p className="mt-1 font-semibold text-[#0F172A]">{job.location ?? 'TBD'}</p>
            </div>
            <div className="rounded-2xl border border-[#EEF2F7] bg-[#F9FAFB] p-3 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A94A6]">Seniority</p>
              <p className="mt-1 font-semibold text-[#0F172A]">{job.seniority ?? 'Not set'}</p>
            </div>
            <div className="rounded-2xl border border-[#EEF2F7] bg-[#F9FAFB] p-3 text-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A94A6]">Status</p>
              <p className="mt-1 font-semibold text-[#0F172A]">{job.status}</p>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-card-soft">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-[#3D64FF]" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A94A6]">Sorting snapshot</p>
                <h2 className="text-lg font-semibold text-[#0F172A]">Live shortlist status</h2>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${sortingTone[sortingState].className}`}
            >
              <span className="h-2 w-2 rounded-full bg-current" />
              {sortingTone[sortingState].label}
            </span>
          </div>

          {sortingState === 'PROCESSING' && (
            <div className="space-y-2 rounded-2xl border border-[#EEF2F7] bg-[#F9FAFB] p-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#EEF2F7]">
                <div className="h-full animate-pulse rounded-full bg-gradient-to-r from-[#8A94A6] via-[#3D64FF]/70 to-[#3D64FF]" />
              </div>
              <p className="text-xs text-[#6B7280]">Processing uploaded CVs and regenerating the ranked list.</p>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#EEF2F7] bg-[#F9FAFB]/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A94A6]">CVs uploaded</p>
              <p className="mt-1 text-xl font-semibold text-[#0F172A]">{uploadedCount}</p>
              <p className="text-xs text-[#6B7280]">{processedCount} processed</p>
            </div>
            <div className="rounded-2xl border border-[#EEF2F7] bg-[#F9FAFB]/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A94A6]">Shortlisted</p>
              <p className="mt-1 text-xl font-semibold text-[#0F172A]">{job.shortlist}</p>
              <p className="text-xs text-[#6B7280]">
                {shortlistSize ? `${shortlistSize} target shortlist` : 'Target not set'}
              </p>
            </div>
            <div className="rounded-2xl border border-[#EEF2F7] bg-[#F9FAFB]/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A94A6]">Average match</p>
              <p className="mt-1 text-xl font-semibold text-[#0F172A]">
                {averageScore !== null ? `${averageScore}%` : '--'}
              </p>
              <p className="text-xs text-[#6B7280]">Across current shortlist</p>
            </div>
            <div className="rounded-2xl border border-[#EEF2F7] bg-[#F9FAFB]/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A94A6]">Skill coverage</p>
              <p className="mt-1 text-xl font-semibold text-[#0F172A]">
                {coverage !== null ? `${coverage}%` : '--'}
              </p>
              <p className="text-xs text-[#6B7280]">
                {requiredSkills.length ? `${requiredSkills.length} required skills` : 'Add required skills to track'}
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-[#EEF2F7] bg-[#F9FAFB]/70 p-4">
            {sortingState !== 'COMPLETED' ? (
              <p className="text-sm text-[#4B5563]">
                Short results will appear here once sorting finishes. Start or rerun sorting to refresh the shortlist.
              </p>
            ) : resultsLoading ? (
              <div className="flex items-center gap-2 text-sm text-[#4B5563]">
                <Loader2 className="h-4 w-4 animate-spin text-[#3D64FF]" />
                Loading shortlist preview...
              </div>
            ) : resultsError ? (
              <p className="text-sm text-[#B91C1C]">Unable to load shortlist preview: {resultsError}</p>
            ) : shortlistedCount === 0 ? (
              <p className="text-sm text-[#4B5563]">
                Sorting completed but no ranked profiles were returned. Try uploading more CVs or adjusting requirements.
              </p>
            ) : (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A94A6]">Top match</p>
                    <p className="text-sm text-[#4B5563]">
                      {shortlistedCount} shortlisted • {holdCount} on hold
                    </p>
                  </div>
                  {topCandidate?.stage && (
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${stageMeta[topCandidate.stage].className}`}
                    >
                      <span className="h-2 w-2 rounded-full bg-current" />
                      {stageMeta[topCandidate.stage].label}
                    </span>
                  )}
                </div>
                {topCandidate && (
                  <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-inner">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-[#0F172A]">{topCandidate.name}</p>
                        <p className="text-xs text-[#6B7280]">{topCandidate.experience || 'Experience not parsed'}</p>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-[#DCFCE7] bg-[#E6F4EA] px-3 py-1 text-sm font-semibold text-[#166534]">
                        <Star className="h-4 w-4" />
                        {topCandidate.matchScore}%
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-[#374151]">{topCandidate.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {topCandidate.matchedSkills.slice(0, 6).map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-2 rounded-full bg-[#F1F5F9] px-3 py-1 text-xs font-semibold text-[#0F172A]"
                        >
                          {skill}
                        </span>
                      ))}
                      {topCandidate.matchedSkills.length === 0 && (
                        <span className="text-xs text-[#6B7280]">No skills extracted yet.</span>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#6B7280]">
                      {requiredSkills.length ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#EEF2FF] px-3 py-1 font-semibold text-[#3D64FF]">
                          {requiredSkills.length} required skills
                        </span>
                      ) : null}
                      <Link
                        href={`/results/${job.id}`}
                        className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#FFFFFF] px-3 py-1 font-semibold text-[#0F172A] transition hover:border-[#3D64FF]/50 hover:text-[#3D64FF]"
                      >
                        Open full results
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-card-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <UploadCloud className="h-5 w-5 text-[#3D64FF]" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A94A6]">CV uploads</p>
              <h2 className="text-lg font-semibold text-[#0F172A]">Files attached to this job</h2>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#F5F7FB] px-3 py-1 font-semibold text-[#1F2A44]">
              {uploadedCount} uploaded
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#E6F4EA] px-3 py-1 font-semibold text-[#1B806A]">
              {processedCount} processed
            </span>
          </div>
        </div>

        {resumeLoading ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-[#4B5563]">
            <Loader2 className="h-4 w-4 animate-spin text-[#3D64FF]" />
            Loading CVs...
          </div>
        ) : resumeError ? (
          <p className="mt-4 text-sm text-[#B91C1C]">Unable to load CVs: {resumeError}</p>
        ) : resumeFiles.length === 0 ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-[#DCE0E0] bg-[#F7F9FC] p-4">
            <div className="space-y-1 text-sm text-[#4B5563]">
              <p>No CVs are attached to this job yet.</p>
              <p className="text-xs text-[#6B7280]">Upload CVs now to enable sorting.</p>
            </div>
            <Link
              href={uploadHref}
              className="inline-flex items-center gap-2 rounded-full border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#3D64FF] transition hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/25"
            >
              Upload CVs
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {resumeFiles.slice(0, 6).map((file) => {
              const tone = resumeTone[file.status] ?? { label: file.status, className: 'bg-[#F5F7FB] text-[#374151]' };
              return (
                <div
                  key={file.resumeId}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#EEF2F7] bg-[#F9FAFB]/70 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E8F2FF] text-[#1C64F2]">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-[#0F172A]">{file.name}</p>
                      <p className="text-xs text-[#6B7280]">
                        {file.mimeType || 'File'} · {formatBytes(file.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B7280]">
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold ${tone.className}`}>
                      <span className="h-2 w-2 rounded-full bg-current" />
                      {tone.label}
                    </span>
                    <span className="rounded-full bg-[#F5F7FB] px-3 py-1 font-semibold text-[#1F2A44]">Resume ID {file.resumeId}</span>
                  </div>
                </div>
              );
            })}
            {resumeFiles.length > 6 && (
              <p className="text-xs text-[#6B7280]">Showing latest 6 uploads. Open results to review all CVs.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
