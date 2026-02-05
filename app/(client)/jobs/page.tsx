"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Briefcase,
  CalendarClock,
  ChevronRight,
  Filter,
  LineChart,
  Plus,
  Users2,
} from "lucide-react";
import { Pagination } from "@/app/components/Pagination";
import type { ApiJob, JobSummary, SortingState } from "./data";
import { mapJobToSummary } from "./data";

const statusStyles: Record<string, string> = {
  Active: "bg-[#E8F2FF] text-[#1C64F2]",
  Draft: "bg-[#FFF5E5] text-[#A26B00]",
  Reviewing: "bg-[#E9E5FF] text-[#5B32D2]",
  Completed: "bg-[#E6F4EA] text-[#1B806A]",
};

const sortingStyles: Record<
  SortingState,
  { label: string; className: string }
> = {
  NOT_STARTED: {
    label: "Needs sorting",
    className: "bg-[#FFF5E5] text-[#9A5B00]",
  },
  PROCESSING: { label: "Processing", className: "bg-[#FEF3C7] text-[#92400E]" },
  COMPLETED: { label: "Sorted", className: "bg-[#E6F4EA] text-[#1B806A]" },
};

const sortingFilterOptions: Array<{
  value: "all" | SortingState;
  label: string;
}> = [
  { value: "all", label: "All sorting states" },
  { value: "NOT_STARTED", label: "Needs sorting" },
  { value: "PROCESSING", label: "Processing" },
  { value: "COMPLETED", label: "Sorted" },
];

export default function JobsPage() {
  const [sortingFilter, setSortingFilter] = useState<"all" | SortingState>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | JobSummary["status"]>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rawJobs, setRawJobs] = useState<ApiJob[]>([]);
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [viewerId, setViewerId] = useState<string | null>(null);
  const [jobsPage, setJobsPage] = useState(1);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const jobsPageSize = 5;

  const loadJobs = useCallback(
    async (opts?: { showSpinner?: boolean; signal?: AbortSignal }) => {
      const showSpinner = opts?.showSpinner ?? false;
      try {
        if (showSpinner) setLoading(true);
        setError("");
        const response = await fetch("/api/jobs", { cache: "no-store", signal: opts?.signal });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error ?? "Failed to load jobs");
        }
        const apiJobs = Array.isArray(payload?.jobs) ? (payload.jobs as ApiJob[]) : [];
        setViewerId((payload?.viewerId as string | undefined) ?? null);
        setRawJobs(apiJobs);
        setJobs(apiJobs.map(mapJobToSummary));
        setLastSync(new Date());
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        const message = (err as Error)?.message ?? "Failed to load jobs";
        setError(message);
      } finally {
        if (showSpinner) setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    loadJobs({ showSpinner: true, signal: controller.signal });
    const interval = setInterval(() => {
      loadJobs({ showSpinner: false, signal: controller.signal }).catch(() => undefined);
    }, 10000);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [loadJobs]);

  const statusFilterOptions: Array<{ value: "all" | JobSummary["status"]; label: string }> = useMemo(() => {
    const unique = new Set(jobs.map((job) => job.status));
    return ["all", ...Array.from(unique)].map((status) => ({
      value: status as "all" | JobSummary["status"],
      label: status === "all" ? "All statuses" : status,
    }));
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const matchesFilters = (job: JobSummary) => {
      const matchesSorting =
        sortingFilter === "all"
          ? true
          : sortingFilter === "PROCESSING"
          ? job.sortingState === "PROCESSING"
          : sortingFilter === "COMPLETED"
          ? job.sortingState === "COMPLETED"
          : job.sortingState === "NOT_STARTED";

      const matchesStatus =
        statusFilter === "all" ? true : job.status === statusFilter;
      const matchesSearch =
        searchTerm.trim().length === 0
          ? true
          : `${job.title} ${job.owner}`
              .toLowerCase()
              .includes(searchTerm.toLowerCase());

      return matchesSorting && matchesStatus && matchesSearch;
    };

    return jobs.filter(matchesFilters);
  }, [jobs, searchTerm, sortingFilter, statusFilter]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredJobs.length / jobsPageSize));
    if (jobsPage > maxPage) {
      setJobsPage(maxPage);
    }
  }, [filteredJobs.length, jobsPage, jobsPageSize]);

  const paginatedJobs = useMemo(() => {
    const start = (jobsPage - 1) * jobsPageSize;
    return filteredJobs.slice(start, start + jobsPageSize);
  }, [filteredJobs, jobsPage, jobsPageSize]);

  const yourJobs = useMemo(() => {
    if (!viewerId) return [];
    return rawJobs.filter((job) => job.createdBy?.id === viewerId).map(mapJobToSummary);
  }, [rawJobs, viewerId]);

  const jobVelocity = useMemo(() => {
    const today = new Date();
    const days: Record<string, number> = {};
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((day) => {
      days[day] = 0;
    });
    rawJobs.forEach((job) => {
      if (!job.createdAt) return;
      const created = new Date(job.createdAt);
      const diffDays = (today.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays <= 6) {
        days[created.toLocaleDateString("en-US", { weekday: "short" })] += 1;
      }
    });
    return Object.entries(days).map(([label, value]) => ({ label, value }));
  }, [rawJobs]);

  const maxVelocity = useMemo(() => {
    const values = jobVelocity.map((item) => item.value);
    const max = values.length ? Math.max(...values) : 0;
    return max || 1;
  }, [jobVelocity]);

  const totals = useMemo(() => {
    const total = jobs.length;
    const active = jobs.filter((job) => job.status === "Active").length;
    const draft = jobs.filter((job) => job.status === "Draft").length;
    const needsSorting = jobs.filter((job) => job.sortingState === "NOT_STARTED").length;
    const processing = jobs.filter((job) => job.sortingState === "PROCESSING").length;
    const sorted = jobs.filter((job) => job.sortingState === "COMPLETED").length;
    const uploadedCvs = jobs.reduce((sum, job) => sum + (job.candidates ?? 0), 0);
    const shortlisted = jobs.reduce((sum, job) => sum + (job.shortlist ?? 0), 0);
    return { total, active, draft, needsSorting, processing, sorted, uploadedCvs, shortlisted };
  }, [jobs]);

  const summaryCards: Array<{ label: string; value: number | string; helper: string; icon: LucideIcon }> = useMemo(
    () => [
      { label: "Open roles", value: totals.total, helper: `${totals.active} active · ${totals.draft} drafts`, icon: Briefcase },
      { label: "Sorting state", value: `${totals.processing} processing`, helper: `${totals.needsSorting} need sorting · ${totals.sorted} sorted`, icon: LineChart },
      { label: "CVs uploaded", value: totals.uploadedCvs, helper: `${totals.shortlisted} shortlisted`, icon: Users2 },
      { label: "Created by you", value: yourJobs.length, helper: viewerId ? "Owned by you" : "Sign in to filter", icon: BarChart3 },
    ],
    [totals, viewerId, yourJobs.length],
  );

  const linePoints = useMemo(() => {
    if (!jobVelocity.length) return "";
    return jobVelocity
      .map((item, index) => {
        const x = jobVelocity.length === 1 ? 0 : (index / (jobVelocity.length - 1)) * 100;
        const y = 100 - (item.value / maxVelocity) * 100;
        return `${x},${y}`;
      })
      .join(" ");
  }, [jobVelocity, maxVelocity]);

  const stageDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    rawJobs.forEach((job) => {
      const label = mapJobToSummary(job).status;
      counts[label] = (counts[label] ?? 0) + 1;
    });
    return Object.entries(counts).map(([label, count]) => ({ label, count }));
  }, [rawJobs]);

  const hasVelocityData = useMemo(
    () => jobVelocity.some((item) => item.value > 0),
    [jobVelocity],
  );

  return (
    <div className="space-y-10 text-[#181B31]">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#E5E7EB] bg-white px-6 py-5 shadow-card-soft">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A94A6]">
            Pipeline
          </p>
          <h1 className="mt-1 text-2xl font-semibold">Jobs</h1>
          <p className="text-sm text-[#4B5563]">
            Track every opening, monitor performance, and jump back into your
            drafts.
          </p>
        </div>
        <Link
          href="/jobs/new"
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-[#f06292] px-4 py-3 text-sm font-semibold text-white shadow-[0_20px_45px_-22px_rgba(216,8,128,0.55)] transition hover:translate-y-[-2px]"
        >
          <Plus className="h-4 w-4" />
          Create New Job
        </Link>
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <button
            type="button"
            onClick={() => loadJobs({ showSpinner: true })}
            className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 font-semibold text-[#181B31] transition hover:border-[#3D64FF]/50 hover:text-[#3D64FF]"
          >
            Refresh
          </button>
          <span className="text-[11px]">
            {lastSync ? `Synced ${lastSync.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Syncing..."}
          </span>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-card-soft">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E8EDFF] to-white text-[#3D64FF]">
              <card.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A94A6]">{card.label}</p>
              <p className="text-xl font-semibold text-[#181B31]">{card.value}</p>
              <p className="text-xs text-[#6B7280]">{card.helper}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-card-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LineChart className="h-5 w-5 text-[#3D64FF]" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A94A6]">
                  New jobs this week
                </p>
                <h2 className="text-lg font-semibold text-[#181B31]">Velocity</h2>
              </div>
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#3D64FF]">
              Live
            </span>
          </div>
          <div className="mt-5 rounded-2xl bg-gradient-to-br from-[#F5F7FB] to-white p-5">
            {hasVelocityData ? (
              <svg viewBox="0 0 100 100" className="h-48 w-full">
                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3D64FF" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#3D64FF" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                <polyline fill="url(#lineGradient)" stroke="none" points={`0,100 ${linePoints} 100,100`} />
                <polyline
                  fill="none"
                  stroke="#3D64FF"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  points={linePoints}
                />
                {jobVelocity.map((item, index) => {
                  const x = (index / (jobVelocity.length - 1)) * 100;
                  const y = 100 - (item.value / maxVelocity) * 100;
                  return <circle key={item.label} cx={x} cy={y} r="2.2" fill="#3D64FF" />;
                })}
                {jobVelocity.map((item, index) => {
                  const x = (index / (jobVelocity.length - 1)) * 100;
                  const y = 100 - (item.value / maxVelocity) * 100;
                  return (
                    <text key={`${item.label}-label`} x={x} y={y - 5} textAnchor="middle" fontSize="7" fill="#4B5563">
                      {item.value}
                    </text>
                  );
                })}
                {jobVelocity.map((item, index) => {
                  const x = (index / (jobVelocity.length - 1)) * 100;
                  return (
                    <text key={`${item.label}-axis`} x={x} y={98} textAnchor="middle" fontSize="7" fill="#9CA3AF">
                      {item.label}
                    </text>
                  );
                })}
              </svg>
            ) : (
              <div className="flex h-48 items-center justify-center rounded-2xl bg-white/60 text-sm text-[#6B7280]">
                No jobs created in the past week.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-card-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-[#3D64FF]" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A94A6]">
                  Stage load
                </p>
                <h2 className="text-lg font-semibold text-[#181B31]">
                  Active workload
                </h2>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-[#8A94A6]" />
          </div>
          <div className="mt-5 space-y-4">
            {stageDistribution.map((stage) => {
              const maxCount = stageDistribution.length
                ? Math.max(...stageDistribution.map((item) => item.count))
                : 1;
              const width = `${Math.max(12, (stage.count / maxCount) * 100)}%`;
              return (
                <div key={stage.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-[#4B5563]">
                    <span className="font-medium text-[#181B31]">
                      {stage.label}
                    </span>
                    <span className="rounded-full bg-[#F5F7FB] px-3 py-1 text-xs font-semibold text-[#3D64FF]">
                      {stage.count}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#EEF2F7]">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-[#3D64FF] to-[#7C8CFF]"
                      style={{ width }}
                    />
                  </div>
                </div>
              );
            })}
            {!stageDistribution.length && (
              <p className="text-xs text-[#9CA3AF]">No jobs yet. Create one to see pipeline load.</p>
            )}
          </div>
        </div>
      </div>

      {viewerId && (
        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-card-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A94A6]">
                Your jobs
              </p>
              <h2 className="text-lg font-semibold text-[#181B31]">Created by you</h2>
            </div>
            <Link
              href="/jobs/new"
              className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#181B31] transition hover:border-[#3D64FF]/40 hover:bg-[#F5F7FB]"
            >
              Start new
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {yourJobs.length ? (
              yourJobs.slice(0, 5).map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="flex items-center justify-between rounded-2xl border border-[#F0F2F5] bg-[#F9FAFB]/60 px-4 py-3 text-sm text-[#1F2A44] transition hover:bg-white"
                >
                  <div>
                    <p className="font-semibold">{job.title}</p>
                    <p className="text-xs text-[#6B7280]">Updated {job.updated}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                      statusStyles[job.status] ?? "bg-[#EEF2F7] text-[#1F2A44]"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-current" />
                    {job.status}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-[#6B7280]">No jobs created by you yet.</p>
            )}
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-card-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Briefcase className="h-5 w-5 text-[#3D64FF]" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A94A6]">
                Job list
              </p>
              <h2 className="text-lg font-semibold text-[#181B31]">
                All openings
              </h2>
            </div>
          </div>
          <Link
            href="/jobs/new"
            className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#181B31] transition hover:border-[#3D64FF]/40 hover:bg-[#F5F7FB]"
          >
            Start new
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1.1fr_1.1fr_0.95fr]">
          <div className="rounded-2xl border border-[#F0F2F5] bg-[#F9FAFB]/70 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8A94A6]">
              <Filter className="h-3.5 w-3.5" />
              Sorting
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {sortingFilterOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSortingFilter(option.value)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    sortingFilter === option.value
                      ? "border-[#3D64FF]/60 bg-[#3D64FF]/15 text-[#3D64FF] shadow-glow-primary"
                      : "border-[#E5E7EB] text-[#4B5563] hover:border-[#3D64FF]/40 hover:text-[#3D64FF]"
                  }`}
                >
                  {option.value === "NOT_STARTED" && (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  )}
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#F0F2F5] bg-[#F9FAFB]/70 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#8A94A6]">
              <Filter className="h-3.5 w-3.5" />
              Status
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {statusFilterOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStatusFilter(option.value)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    statusFilter === option.value
                      ? "border-[#3D64FF]/60 bg-[#3D64FF]/15 text-[#3D64FF]"
                      : "border-[#E5E7EB] text-[#4B5563] hover:border-[#3D64FF]/40 hover:text-[#3D64FF]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#F0F2F5] bg-[#F9FAFB]/70 p-4">
            <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#8A94A6]">
              <span>Search</span>
              <span className="text-[11px] text-[#9CA3AF]">Role or owner</span>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-3">
              <Filter className="h-4 w-4 text-[#3D64FF]" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="e.g. Backend, Nora"
                className="w-full bg-transparent py-2.5 text-sm text-[#181B31] placeholder:text-[#9CA3AF] focus:outline-none"
              />
            </div>
            <p className="mt-2 text-[11px] text-[#9CA3AF]">
              Live filters run against your job list—no hardcoded demos.
            </p>
          </div>
        </div>

        <div className="mt-5 divide-y divide-[#F0F2F5] rounded-2xl border border-[#F0F2F5] bg-[#F9FAFB]/60">
          <div className="grid grid-cols-[1.6fr_0.9fr_1fr_1fr_0.95fr] items-center px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#8A94A6]">
            <span>Role</span>
            <span>Status</span>
            <span>Sorting</span>
            <span>Owner</span>
            <span>Activity</span>
          </div>
          {error && (
            <div className="px-4 py-6 text-sm text-red-600">
              {error}
            </div>
          )}
          {loading && !error && (
            <div className="px-4 py-6 text-sm text-[#6B7280]">Loading jobs...</div>
          )}
          {!loading &&
            !error &&
            paginatedJobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="grid grid-cols-[1.6fr_0.9fr_1fr_1fr_0.95fr] items-center gap-3 px-4 py-4 text-sm text-[#1F2A44] transition hover:bg-white"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{job.title}</p>
                    {job.sortingState === "NOT_STARTED" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF1F2] px-2 py-1 text-[11px] font-semibold text-[#9A1035]">
                        <AlertTriangle className="h-3 w-3" />
                        Needs sorting
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                    <CalendarClock className="h-3.5 w-3.5" />
                    <span>Created {job.created}</span>
                  </div>
                </div>
                <span
                  className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                    statusStyles[job.status] ?? "bg-[#EEF2F7] text-[#1F2A44]"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-current" />
                  {job.status}
                </span>
                <span
                  className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                    sortingStyles[job.sortingState]?.className ??
                    "bg-[#EEF2F7] text-[#1F2A44]"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-current" />
                  {sortingStyles[job.sortingState]?.label ?? "Unknown"}
                </span>
                <span className="text-sm font-medium text-[#1F2A44]">
                  {job.owner}
                </span>
                <div className="flex items-center justify-between gap-2 text-xs text-[#6B7280]">
                  <span className="flex flex-col gap-1">
                    <span>
                      Updated {job.updated}
                      {job.lastSorted ? ` • Last sort ${job.lastSorted}` : ""}
                    </span>
                    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-[#EAF7ED] px-3 py-1 font-semibold text-[#1B806A]">
                      <Users2 className="h-3.5 w-3.5" />
                      Shortlist {job.shortlist}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-[#C0C4CC]" />
                </div>
              </Link>
            ))}
          {!loading && !error && filteredJobs.length === 0 && (
            <div className="px-4 py-6 text-sm text-[#6B7280]">
              No jobs match the selected filters. Try clearing the search or
              sorting state.
            </div>
          )}
        </div>

        <div className="mt-4">
          <Pagination
            page={jobsPage}
            totalItems={filteredJobs.length}
            pageSize={jobsPageSize}
            onPageChange={setJobsPage}
          />
        </div>
      </div>
    </div>
  );
}
