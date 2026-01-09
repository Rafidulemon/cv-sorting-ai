'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  UserRound,
  Users2,
} from 'lucide-react';
import type { SortingState } from '../data';
import { jobDetails } from '../data';

const sortingTone: Record<SortingState, { label: string; className: string; helper: string }> = {
  not_started: {
    label: 'Needs sorting',
    className: 'bg-[#FFF5E5] text-[#9A5B00]',
    helper: 'No sorting run yet. Kick off the first pass to get a shortlist.',
  },
  processing: {
    label: 'Processing',
    className: 'bg-[#FEF3C7] text-[#92400E]',
    helper: 'Sorting in progress. We will refresh results once complete.',
  },
  completed: {
    label: 'Sorted',
    className: 'bg-[#E6F4EA] text-[#1B806A]',
    helper: 'Last run complete. Rerun anytime with new CVs or updated criteria.',
  },
};

export default function JobDetailPage() {
  const router = useRouter();
  const pathname = usePathname();

  const jobId = useMemo(() => pathname?.split('/').filter(Boolean).pop() ?? '', [pathname]);
  const job = jobDetails[jobId];
  const [sortingState, setSortingState] = useState<SortingState>(job?.sortingState ?? 'not_started');
  const [lastSorted, setLastSorted] = useState<string | null>(job?.lastSorted ?? null);
  const [runCount, setRunCount] = useState(job?.sortingRuns ?? (job?.sortingState === 'completed' ? 1 : 0));
  const [isKickingOff, setIsKickingOff] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!job) {
      router.replace('/jobs');
    }
  }, [job, router]);

  useEffect(() => {
    if (!job) return;
    setSortingState(job.sortingState);
    setLastSorted(job.lastSorted ?? null);
    setRunCount(job.sortingRuns ?? (job.sortingState === 'completed' ? 1 : 0));
    setIsKickingOff(false);
  }, [job]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!job) return null;

  const statusTone =
    job.status === 'Active'
      ? 'bg-[#E8F2FF] text-[#1C64F2]'
      : job.status === 'Draft'
        ? 'bg-[#FFF5E5] text-[#A26B00]'
        : job.status === 'Reviewing'
          ? 'bg-[#E9E5FF] text-[#5B32D2]'
          : 'bg-[#E6F4EA] text-[#1B806A]';

  const canViewResults = sortingState === 'completed';
  const disableStart = isKickingOff || sortingState === 'processing';

  const startSorting = () => {
    if (disableStart) return;
    setIsKickingOff(true);
    setSortingState('processing');
    timeoutRef.current = setTimeout(() => {
      setSortingState('completed');
      setLastSorted('Just now');
      setRunCount((prev) => prev + 1);
      setIsKickingOff(false);
    }, 1800);
  };

  return (
    <div className="space-y-8 text-[#181B31]">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#E5E7EB] bg-white px-6 py-5 shadow-card-soft">
        <div className="space-y-2">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8A94A6] transition hover:text-[#3D64FF]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to jobs
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">{job.title}</h1>
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
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-[#4B5563]">
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
              {job.location}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/jobs/new"
            className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#181B31] transition hover:border-[#3D64FF]/40 hover:bg-[#F5F7FB]"
          >
            Duplicate &amp; edit
          </Link>
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
              View results
              <Sparkles className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-card-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A94A6]">CV sorting</p>
            <h2 className="text-lg font-semibold text-[#181B31]">Start or rerun the shortlist</h2>
            <p className="text-sm text-[#4B5563]">{sortingTone[sortingState].helper}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#6B7280]">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#F5F7FB] px-3 py-1 font-semibold text-[#1F2A44]">
                <CalendarClock className="h-3.5 w-3.5 text-[#3D64FF]" />
                {lastSorted ? `Last sorted ${lastSorted}` : 'No run yet'}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#E5EAFE] px-3 py-1 font-semibold text-[#3D64FF]">
                {runCount || 0} {runCount === 1 ? 'run' : 'runs'}
              </span>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${sortingTone[sortingState].className}`}
          >
            <span className="h-2 w-2 rounded-full bg-current" />
            {sortingTone[sortingState].label}
          </span>
        </div>

        {sortingState === 'processing' && (
          <div className="mt-4 space-y-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-[#EEF2F7]">
              <div className="h-full animate-pulse rounded-full bg-gradient-to-r from-[#8A94A6] via-[#3D64FF]/70 to-[#3D64FF]" />
            </div>
            <p className="text-xs text-[#6B7280]">Processing uploaded CVs and regenerating the ranked list.</p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
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
            {sortingState === 'completed' ? <RotateCcw className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            {sortingState === 'completed' ? 'Rerun sorting' : 'Start CV sorting'}
            {isKickingOff && <Loader2 className="h-4 w-4 animate-spin" />}
          </button>
          {canViewResults ? (
            <Link
              href={`/results/${job.id}`}
              className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#FFFFFF] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#181B31] transition hover:border-[#3D64FF]/40 hover:bg-[#F5F7FB]"
            >
              View latest results
            </Link>
          ) : (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#F5F7FB] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#8A94A6]"
              disabled
            >
              Results unlock after sorting
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-card-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-[#3D64FF]" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A94A6]">Overview</p>
                <h2 className="text-lg font-semibold text-[#181B31]">Role summary</h2>
              </div>
            </div>
            <span className="text-xs text-[#8A94A6]">Updated {job.updated}</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[#4B5563]">{job.summary}</p>
          <div className="mt-5 space-y-2 rounded-2xl border border-[#F0F2F5] bg-[#F9FAFB]/70 p-4">
            {job.requirements.map((item) => (
              <div key={item} className="flex items-start gap-2 text-sm text-[#1F2A44]">
                <BadgeCheck className="mt-1 h-4 w-4 text-[#3D64FF]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-card-soft">
          <div className="flex items-center gap-3">
            <Users2 className="h-5 w-5 text-[#3D64FF]" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A94A6]">Pipeline</p>
              <h2 className="text-lg font-semibold text-[#181B31]">Progress</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {job.metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-[#F0F2F5] bg-[#F9FAFB]/80 p-4 text-sm shadow-inner"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A94A6]">{metric.label}</p>
                <p className="mt-1 text-xl font-semibold text-[#181B31]">{metric.value}</p>
                <p className="text-xs text-[#6B7280]">{metric.helper}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-3">
            {job.updates.map((update) => (
              <div
                key={update.label}
                className="flex items-center justify-between rounded-2xl border border-[#F0F2F5] bg-[#FFFFFF] px-4 py-3 text-sm text-[#1F2A44]"
              >
                <div className="space-y-1">
                  <p className="font-semibold">{update.label}</p>
                  <p className="text-xs text-[#6B7280]">{update.value}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    update.tone === 'positive'
                      ? 'bg-[#E6F4EA] text-[#1B806A]'
                      : 'bg-[#F5F7FB] text-[#4B5563]'
                  }`}
                >
                  {update.tone === 'positive' ? 'On track' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
