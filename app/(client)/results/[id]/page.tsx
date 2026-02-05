'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowUpDown,
  Download,
  Eye,
  Filter,
  FileBarChart,
  FileText,
  ScrollText,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react';
import { Pagination } from '@/app/components/Pagination';
import { stageMeta, type CandidateResult } from '../data';

export default function ResultsPage() {
  const params = useParams<{ id: string | string[] }>();
  const jobIdRaw = params?.id;
  const jobId = Array.isArray(jobIdRaw) ? jobIdRaw[0] : jobIdRaw;
  const [sortBy, setSortBy] = useState<'score' | 'name'>('score');
  const [skillFilter, setSkillFilter] = useState('');
  const [candidateRows, setCandidateRows] = useState<CandidateResult[]>([]);
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [shortlistSize, setShortlistSize] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shortlistPage, setShortlistPage] = useState(1);
  const [holdPage, setHoldPage] = useState(1);
  const [rejectedPage, setRejectedPage] = useState(1);
  const pageSize = 4;

  useEffect(() => {
    const controller = new AbortController();
    const fetchResults = async () => {
      if (!jobId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/jobs/${encodeURIComponent(jobId)}/results`, { signal: controller.signal });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || `Request failed (${res.status})`);
        }
        const body = (await res.json()) as {
          candidates: CandidateResult[];
          requiredSkills?: string[];
          shortlistSize?: number | null;
        };
        setCandidateRows(body.candidates ?? []);
        setRequiredSkills(body.requiredSkills ?? []);
        setShortlistSize(body.shortlistSize ?? null);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
    return () => controller.abort();
  }, [jobId]);

  const shortlist = useMemo(() => {
    const filtered = skillFilter
      ? candidateRows.filter(
          (candidate) =>
            candidate.stage === 'shortlist' &&
            candidate.matchedSkills.some((skill) => skill.toLowerCase().includes(skillFilter.toLowerCase())),
        )
      : candidateRows.filter((candidate) => candidate.stage === 'shortlist');

    return [...filtered].sort((a, b) =>
      sortBy === 'score' ? b.matchScore - a.matchScore : a.name.localeCompare(b.name),
    );
  }, [candidateRows, skillFilter, sortBy]);

  const hold = useMemo(
    () => candidateRows.filter((candidate) => candidate.stage === 'hold'),
    [candidateRows],
  );

  const rejected = useMemo(
    () => candidateRows.filter((candidate) => candidate.stage === 'rejected'),
    [candidateRows],
  );

  useEffect(() => {
    const maxShortlistPage = Math.max(1, Math.ceil(shortlist.length / pageSize));
    const maxHoldPage = Math.max(1, Math.ceil(hold.length / pageSize));
    const maxRejectedPage = Math.max(1, Math.ceil(rejected.length / pageSize));
    if (shortlistPage > maxShortlistPage) setShortlistPage(maxShortlistPage);
    if (holdPage > maxHoldPage) setHoldPage(maxHoldPage);
    if (rejectedPage > maxRejectedPage) setRejectedPage(maxRejectedPage);
  }, [hold.length, pageSize, rejected.length, shortlist.length, holdPage, shortlistPage, rejectedPage]);

  const paginate = (list: CandidateResult[], page: number) => {
    const start = (page - 1) * pageSize;
    return list.slice(start, start + pageSize);
  };

  const paginatedShortlist = useMemo(() => paginate(shortlist, shortlistPage), [shortlist, shortlistPage]);
  const paginatedHold = useMemo(() => paginate(hold, holdPage), [hold, holdPage]);
  const paginatedRejected = useMemo(() => paginate(rejected, rejectedPage), [rejected, rejectedPage]);

  const topCandidate = shortlist[0];
  const averageCoverage =
    shortlist.length === 0 || requiredSkills.length === 0
      ? null
      : Math.round(
          (shortlist.reduce((acc, candidate) => acc + candidate.skillGap.present.length, 0) /
            (shortlist.length * requiredSkills.length)) *
            100,
        );

  const shortlistedCount = shortlist.length;
  const holdCount = hold.length;
  const rejectedCount = rejected.length;

  const averageScore =
    shortlist.length === 0
      ? null
      : Math.round(shortlist.reduce((acc, candidate) => acc + candidate.matchScore, 0) / shortlist.length);

  const metrics = [
    {
      label: 'CVs processed',
      value: candidateRows.length.toString(),
      helper: `${shortlistedCount} shortlisted`,
    },
    {
      label: 'Avg. match score',
      value: averageScore !== null ? `${averageScore}%` : '--',
      helper: shortlist.length ? 'Based on shortlisted pool' : 'Add CVs to calculate',
    },
    { label: 'Time saved', value: '6.2h', helper: 'Compared to manual review' },
  ];

  const removeCandidate = (candidateId: string) => {
    setCandidateRows((prev) => prev.filter((candidate) => candidate.id !== candidateId));
  };

  if (error) {
    return (
      <div className="space-y-6 rounded-3xl border border-[#FECACA] bg-[#FFF5F5] p-6 text-[#7F1D1D]">
        <h1 className="text-xl font-semibold">Unable to load results</h1>
        <p className="text-sm">{error}</p>
        <Link href="/jobs" className="text-sm font-semibold text-[#3D64FF] underline">
          Back to jobs
        </Link>
      </div>
    );
  }

  const renderTable = (
    title: string,
    helper: string,
    rows: CandidateResult[],
    total: number,
    page: number,
    onPageChange: (next: number) => void,
  ) => (
    <div className="space-y-3 rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-5 shadow-card-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A94A6]">{title}</p>
          <p className="text-sm text-[#4B5563]">{helper}</p>
        </div>
        <span className="rounded-full bg-[#F5F7FB] px-3 py-1 text-xs font-semibold text-[#3D64FF]">
          {total} {total === 1 ? 'profile' : 'profiles'}
        </span>
      </div>

      <div className="divide-y divide-[#EEF2F7] rounded-2xl border border-[#EEF2F7]">
        <div className="grid grid-cols-[1.5fr_0.7fr_0.9fr_0.9fr] items-center gap-3 bg-[#F9FAFB] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#8A94A6]">
          <span>Candidate</span>
          <span>Score</span>
          <span>Stage</span>
          <span className="text-right">Actions</span>
        </div>
        {rows.length === 0 ? (
          <div className="px-4 py-6 text-sm text-[#6B7280]">No profiles in this stage yet.</div>
        ) : (
          rows.map((candidate) => (
            <div
              key={candidate.id}
              className="grid grid-cols-[1.5fr_0.7fr_0.9fr_0.9fr] items-center gap-3 px-4 py-4 text-sm text-[#1F2A44]"
            >
              <div className="space-y-1">
                <p className="font-semibold">{candidate.name}</p>
                <p className="text-xs text-[#6B7280]">{candidate.experience}</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-success-500/30 bg-success-500/10 px-3 py-1 text-sm font-semibold text-success-700">
                {candidate.matchScore}%
              </span>
              <span
                className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${stageMeta[candidate.stage].className}`}
              >
                <span className="h-2 w-2 rounded-full bg-current" />
                {stageMeta[candidate.stage].label}
              </span>
              <div className="flex items-center justify-end gap-2">
                <Link
                  href={`/results/${jobId ?? 'job'}/candidates/${candidate.id}`}
                  className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-[#FFFFFF] px-3 py-1 text-xs font-semibold text-[#1F2A44] transition hover:border-[#3D64FF]/40 hover:text-[#3D64FF]"
                >
                  <Eye className="h-4 w-4" />
                  View
                </Link>
                <button
                  type="button"
                  onClick={() => removeCandidate(candidate.id)}
                  className="inline-flex items-center gap-1 rounded-full border border-[#FEE2E2] bg-[#FFF5F5] px-3 py-1 text-xs font-semibold text-[#B91C1C] transition hover:border-[#FCA5A5] hover:bg-[#FEE2E2]"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Pagination page={page} totalItems={total} pageSize={pageSize} onPageChange={onPageChange} />
    </div>
  );

  return (
    <div className="space-y-12 text-[#181B31]">
        <section className="relative overflow-hidden rounded-4xl border border-[#DCE0E0]/80 bg-gradient-to-br from-[#FFFFFF] via-[#F2F4F8] to-[#FFFFFF] p-8 shadow-card-soft">
          <div className="pointer-events-none absolute inset-0 opacity-80">
            <div className="absolute -top-24 right-10 h-56 w-56 rounded-full bg-[#3D64FF]/15 blur-3xl" />
            <div className="absolute -bottom-20 left-12 h-48 w-48 rounded-full bg-[#3D64FF]/12 blur-3xl" />
          </div>
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#3D64FF] transition hover:bg-[#3D64FF]/20"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
              </Link>
              <h1 className="text-3xl font-semibold leading-tight text-[#181B31] lg:text-4xl">
                Results - {jobId ? decodeURIComponent(jobId) : 'Unknown job'}
              </h1>
              <p className="max-w-2xl text-sm text-[#4B5563] lg:text-base">
                {loading
                  ? 'Loading ranked candidates...'
                  : shortlistedCount
                    ? `${shortlistedCount} shortlisted${holdCount ? ` · ${holdCount} on hold` : ''}.`
                    : 'No shortlisted candidates yet. Once sorting completes, results will appear here.'}
              </p>
              <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wide text-[#4B5563]">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-3 py-1.5 text-[#181B31]">
                  <Sparkles className="h-3.5 w-3.5 text-[#3D64FF]" />
                  Semantic scoring
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-3 py-1.5 text-[#181B31]">
                  <FileBarChart className="h-3.5 w-3.5 text-[#3D64FF]" />
                  Explainable ranking
                </span>
              </div>
            </div>
            <div className="grid gap-4 rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 text-sm text-[#181B31] shadow-card-soft lg:w-80">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">Quick actions</p>
              <button className="inline-flex items-center justify-center gap-2 rounded-full border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#3D64FF] transition hover:bg-[#3D64FF]/20">
                <Download className="h-4 w-4" />
                Download full report
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-full border border-[#3D64FF]/40 bg-[#FFFFFF] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#3D64FF] transition hover:bg-[#3D64FF]/15">
                <FileText className="h-4 w-4" />
                Generate share link
              </button>
              <p className="text-xs text-[#8A94A6]">
                Includes candidate rationales, score breakdowns, and sourcing recommendations.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {metrics.map((item) => (
            <div
              key={item.label}
              className="relative overflow-hidden rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#3D64FF]/15 via-transparent to-transparent" />
              <div className="relative space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">{item.label}</p>
                <p className="text-3xl font-semibold text-[#181B31]">{item.value}</p>
                <p className="text-xs text-[#4B5563]">{item.helper}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-5 shadow-card-soft">
            <div className="flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] p-1">
              <button
                type="button"
                onClick={() => setSortBy('score')}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                  sortBy === 'score'
                    ? 'bg-[#3D64FF]/20 text-[#3D64FF]'
                    : 'text-[#4B5563] hover:bg-[#3D64FF]/15 hover:text-[#3D64FF]'
                }`}
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                Score
              </button>
              <button
                type="button"
                onClick={() => setSortBy('name')}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                  sortBy === 'name'
                    ? 'bg-[#3D64FF]/20 text-[#3D64FF]'
                    : 'text-[#4B5563] hover:bg-[#3D64FF]/15 hover:text-[#3D64FF]'
                }`}
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                Name
              </button>
            </div>
            <div className="flex min-w-[220px] flex-1 items-center gap-3 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-sm text-[#4B5563] shadow-inner">
              <Filter className="h-4 w-4 text-[#3D64FF]" />
              <input
                type="text"
                value={skillFilter}
                onChange={(event) => setSkillFilter(event.target.value)}
                placeholder="Filter shortlist by skill"
                className="flex-1 bg-transparent text-sm text-[#181B31] placeholder:text-[#8A94A6] focus:outline-none"
              />
            </div>
            <button className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#181B31] transition hover:bg-[#3D64FF]/15 hover:text-[#3D64FF]">
              <ScrollText className="h-4 w-4 text-[#3D64FF]" />
              View audit log
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-5 rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft">
              <h3 className="text-lg font-semibold text-[#181B31]">Processing summary</h3>
              <div className="space-y-3 text-sm text-[#4B5563]">
                <p>
                  <span className="font-semibold text-[#181B31]">Top match:</span>{' '}
                  {topCandidate ? `${topCandidate.name} - ${topCandidate.matchScore}%` : 'Pending'}
                </p>
                <p>
                  <span className="font-semibold text-[#181B31]">Skill coverage:</span>{' '}
                  {averageCoverage !== null ? `${averageCoverage}%` : '--'} average across shortlist
                </p>
                <p>
                  <span className="font-semibold text-[#181B31]">Filtering:</span> Sorted by{' '}
                  {sortBy === 'score' ? 'match score' : 'candidate name'}
                  {skillFilter ? ` - Filtered on "${skillFilter}"` : ' - No skill filter applied'}
                </p>
                <p>
                  <span className="font-semibold text-[#181B31]">Stage mix:</span>{' '}
                  {shortlist.length} shortlisted • {hold.length} on hold • {rejected.length} rejected
                </p>
              </div>
            </div>
            <div className="space-y-4 rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 shadow-card-soft">
              <h3 className="text-lg font-semibold text-[#181B31]">Core skill blueprint</h3>
              <ul className="space-y-3 text-sm text-[#4B5563]">
                {requiredSkills.map((skill) => (
                  <li
                    key={skill}
                    className="flex items-center gap-3 rounded-2xl border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2"
                  >
                    <Star className="h-4 w-4 text-[#3D64FF]" />
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4 rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 text-sm text-[#4B5563] shadow-card-soft">
              <h3 className="text-lg font-semibold text-[#181B31]">Downloads</h3>
              <button className="flex w-full items-center justify-between rounded-2xl border border-[#DCE0E0] bg-[#F9FAFB] px-4 py-3 transition hover:border-[#3D64FF]/40 hover:bg-[#3D64FF]/10">
                <span className="inline-flex items-center gap-2 font-semibold text-[#181B31]">
                  <Download className="h-4 w-4 text-[#3D64FF]" />
                  Export shortlisted
                </span>
                <ArrowLeft className="h-4 w-4 rotate-180 text-[#3D64FF]" />
              </button>
              <button className="flex w-full items-center justify-between rounded-2xl border border-[#DCE0E0] bg-[#F9FAFB] px-4 py-3 transition hover:border-[#3D64FF]/40 hover:bg-[#3D64FF]/10">
                <span className="inline-flex items-center gap-2 font-semibold text-[#181B31]">
                  <FileText className="h-4 w-4 text-[#3D64FF]" />
                  Download audit trail
                </span>
                <ArrowLeft className="h-4 w-4 rotate-180 text-[#3D64FF]" />
              </button>
            </div>
          </div>

          {renderTable(
            'Shortlisted CVs',
            'Top picks ready for hiring manager review.',
            paginatedShortlist,
            shortlist.length,
            shortlistPage,
            setShortlistPage,
          )}
          {renderTable(
            'Hold CVs',
            'Parked profiles to revisit after the first pass.',
            paginatedHold,
            hold.length,
            holdPage,
            setHoldPage,
          )}
          {renderTable(
            'Rejected CVs',
            'Profiles that are not a fit for this role right now.',
            paginatedRejected,
            rejected.length,
            rejectedPage,
            setRejectedPage,
          )}
        </section>
    </div>
  );
}
