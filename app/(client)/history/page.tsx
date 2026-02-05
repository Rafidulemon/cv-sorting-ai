"use client";

import { useEffect, useMemo, useState, type ReactElement } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Download,
  Filter,
  History as HistoryIcon,
  Loader2,
  PauseCircle,
  Sparkles,
} from "lucide-react";
import type { ApiJob, SortingState } from "../jobs/data";
import { mapJobToSummary } from "../jobs/data";

type JobSummaryWithMeta = ReturnType<typeof mapJobToSummary> & {
  raw: ApiJob;
};

const normalizeSortingState = (state?: string | null): SortingState => {
  if (!state) return "NOT_STARTED";
  const value = state.toUpperCase() as SortingState;
  return value === "PROCESSING" || value === "COMPLETED" ? value : "NOT_STARTED";
};

const formatMinutes = (minutes: number | null) => {
  if (minutes === null) return "—";
  if (minutes < 1) return "< 1m";
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hrs = minutes / 60;
  if (hrs < 24) return `${hrs.toFixed(1)}h`;
  const days = hrs / 24;
  return `${days.toFixed(1)}d`;
};

const statusTone: Record<SortingState, string> = {
  NOT_STARTED: "bg-[#f7f2fb] text-[#7c5dfa] border-[#efe7f5]",
  PROCESSING: "bg-[#e8f2ff] text-[#2563eb] border-[#d6e8ff]",
  COMPLETED: "bg-[#e7f8ef] text-[#15803d] border-[#d1f3e0]",
};

const statusIcon: Record<SortingState, ReactElement> = {
  NOT_STARTED: <PauseCircle className="h-4 w-4" />,
  PROCESSING: <Loader2 className="h-4 w-4 animate-spin" />,
  COMPLETED: <CheckCircle2 className="h-4 w-4" />,
};

export default function HistoryPage() {
  const [jobs, setJobs] = useState<ApiJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("/api/jobs", { cache: "no-store" });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.error ?? "Failed to load jobs");
        const data = Array.isArray(payload?.jobs) ? (payload.jobs as ApiJob[]) : [];
        setJobs(data);
      } catch (err) {
        setError((err as Error)?.message ?? "Unable to load history");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const orderedJobs = useMemo(() => {
    return [...jobs].sort((a, b) => {
      const aDate = new Date(a.lastActivityAt ?? a.updatedAt ?? a.createdAt ?? 0).getTime();
      const bDate = new Date(b.lastActivityAt ?? b.updatedAt ?? b.createdAt ?? 0).getTime();
      return bDate - aDate;
    });
  }, [jobs]);

  const runs: JobSummaryWithMeta[] = useMemo(
    () => orderedJobs.map((job) => ({ ...mapJobToSummary(job), raw: job })),
    [orderedJobs],
  );

  const stats = useMemo(() => {
    const completed = orderedJobs.filter((job) => normalizeSortingState(job.sortingState) === "COMPLETED");
    const processing = orderedJobs.filter((job) => normalizeSortingState(job.sortingState) === "PROCESSING");
    const pending = orderedJobs.filter((job) => normalizeSortingState(job.sortingState) === "NOT_STARTED");

    const durations = orderedJobs
      .map((job) => {
        const start = job.createdAt ? new Date(job.createdAt).getTime() : null;
        const end = job.lastActivityAt ? new Date(job.lastActivityAt).getTime() : null;
        if (!start || !end || end < start) return null;
        return (end - start) / 60000; // minutes
      })
      .filter((value): value is number => value !== null);

    const avgDuration = durations.length
      ? durations.reduce((sum, value) => sum + value, 0) / durations.length
      : null;

    const totalSorted = orderedJobs.reduce((sum, job) => sum + (job.cvSortedCount ?? 0), 0);
    const totalAnalyzed = orderedJobs.reduce((sum, job) => sum + (job.cvAnalyzedCount ?? 0), 0);

    return {
      completed: completed.length,
      processing: processing.length,
      pending: pending.length,
      avgDuration,
      totalSorted,
      totalAnalyzed,
    };
  }, [orderedJobs]);

  const upNext = useMemo(
    () =>
      runs
        .filter((run) => normalizeSortingState(run.raw.sortingState) !== "COMPLETED")
        .slice(0, 3),
    [runs],
  );

  const handleExport = () => {
    if (!runs.length) return;
    const header = [
      "Job ID",
      "Title",
      "Status",
      "Sorting State",
      "Sorted CVs",
      "Analyzed CVs",
      "Last Activity",
    ];
    const rows = runs.map((run) => [
      run.id,
      run.title,
      run.status,
      normalizeSortingState(run.raw.sortingState),
      String(run.raw.cvSortedCount ?? 0),
      String(run.raw.cvAnalyzedCount ?? 0),
      new Date(run.raw.lastActivityAt ?? run.raw.updatedAt ?? run.raw.createdAt ?? Date.now()).toISOString(),
    ]);
    const csv = [header, ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "carrix-history.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderRunCard = (run: JobSummaryWithMeta) => {
    const state = normalizeSortingState(run.raw.sortingState);
    const highlight = `${run.raw.cvSortedCount ?? 0} sorted · ${run.raw.cvAnalyzedCount ?? 0} processed`;
    const submitted = new Date(run.raw.createdAt ?? Date.now()).toLocaleString();
    const durationMinutes =
      run.raw.lastActivityAt && run.raw.createdAt
        ? Math.max(
            0,
            Math.round(
              (new Date(run.raw.lastActivityAt).getTime() - new Date(run.raw.createdAt).getTime()) / 60000,
            ),
          )
        : null;

    return (
      <div
        key={run.id}
        className="relative overflow-hidden rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 text-sm shadow-card-soft"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#3D64FF]/12 via-transparent to-transparent" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">
              {run.id}
              <span className="h-1 w-1 rounded-full bg-[#8A94A6]" />
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 ${statusTone[state]}`}
              >
                {statusIcon[state]}
                {state === "COMPLETED" ? "Completed" : state === "PROCESSING" ? "In progress" : "Not started"}
              </span>
            </div>
            <p className="text-base font-semibold text-[#181B31]">{run.title}</p>
            <p className="text-xs text-[#4B5563]">{highlight}</p>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs text-[#4B5563] md:text-sm">
            <div>
              <p className="font-semibold text-[#181B31]">Submitted</p>
              <p className="text-[#8A94A6]">{submitted}</p>
            </div>
            <div>
              <p className="font-semibold text-[#181B31]">Duration</p>
              <p className="text-[#8A94A6]">{formatMinutes(durationMinutes)}</p>
            </div>
            <Link
              href={`/jobs/${run.id}`}
              className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#3D64FF] transition hover:bg-[#3D64FF]/15"
            >
              Review run
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10 text-[#181B31]">
      <section className="relative overflow-hidden rounded-4xl border border-[#DCE0E0]/80 bg-gradient-to-br from-[#FFFFFF] via-[#F2F4F8] to-[#FFFFFF] p-8 shadow-card-soft">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 right-4 h-48 w-48 rounded-full bg-[#3D64FF]/15 blur-3xl" />
          <div className="absolute bottom-[-6rem] left-8 h-44 w-44 rounded-full bg-[#3D64FF]/12 blur-3xl" />
        </div>
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#3D64FF]/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#3D64FF]">
              <HistoryIcon className="h-4 w-4 text-[#3D64FF]" />
              Processing history
            </span>
            <h1 className="text-3xl font-semibold text-[#181B31]">Replay the journey for every job</h1>
            <p className="max-w-2xl text-sm text-[#4B5563] md:text-base">
              Live runs, retries, and completions pulled directly from your jobs. Filter, export, and jump back into any
              screening in one click.
            </p>
            <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wide text-[#4B5563]">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-3 py-1.5 text-[#181B31]">
                <Clock3 className="h-3.5 w-3.5 text-[#3D64FF]" />
                Avg turnaround · {formatMinutes(stats.avgDuration)}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-3 py-1.5 text-[#181B31]">
                <Sparkles className="h-3.5 w-3.5 text-[#3D64FF]" />
                {stats.completed} completed · {stats.processing} running
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-3 py-1.5 text-[#181B31]">
                <CalendarClock className="h-3.5 w-3.5 text-[#3D64FF]" />
                {stats.totalSorted} sorted · {stats.totalAnalyzed} processed
              </span>
            </div>
          </div>
          <div className="flex w-full flex-col gap-3 rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-5 text-sm text-[#181B31] shadow-card-soft md:w-72">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8A94A6]">Quick export</p>
            <p className="text-lg font-semibold text-[#181B31]">Download full audit</p>
            <p className="text-xs text-[#8A94A6]">CSV export built from live data: job IDs, statuses, counts, and last activity.</p>
            <button
              onClick={handleExport}
              className="inline-flex items-center justify-center rounded-full border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#3D64FF] transition hover:bg-[#3D64FF]/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!runs.length}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="flex items-center gap-2 rounded-3xl border border-[#F59E0B] bg-[#FFF7E6] px-4 py-3 text-sm text-[#92400E] shadow-sm">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-[#181B31]">Recent runs</h2>
          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#181B31] transition hover:bg-[#3D64FF]/15 hover:text-[#3D64FF]">
              <Filter className="h-4 w-4 text-[#3D64FF]" />
              Status
            </button>
            <button className="inline-flex items-center gap-2 rounded-full border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#3D64FF] transition hover:bg-[#3D64FF]/20">
              <CalendarClock className="h-4 w-4 text-[#3D64FF]" />
              Latest activity
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((key) => (
                <div
                  key={key}
                  className="h-24 animate-pulse rounded-3xl border border-[#E5E7EB] bg-gradient-to-r from-[#F8FAFC] via-[#F1F5F9] to-[#F8FAFC]"
                />
              ))}
            </div>
          )}

          {!loading && !runs.length && (
            <div className="rounded-3xl border border-dashed border-[#DCE0E0] bg-[#F9FAFB] p-6 text-sm text-[#4B5563]">
              No runs yet. Start by creating a job and uploading CVs to see your processing history here.
            </div>
          )}

          {!loading && runs.map(renderRunCard)}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] p-8 shadow-card-soft">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-14 right-24 h-36 w-36 rounded-full bg-[#3D64FF]/20 blur-3xl" />
        </div>
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#181B31]">Up next</h2>
            <p className="mt-1 text-sm text-[#4B5563]">
              Draft jobs, pending uploads, and runs still processing.
            </p>
          </div>
          <div className="flex flex-1 flex-col gap-4 md:flex-row">
            {!loading && !upNext.length && (
              <div className="flex-1 rounded-3xl border border-[#DCE0E0] bg-[#F9FAFB] p-5 text-sm text-[#4B5563]">
                All caught up. Kick off a new screening from the dashboard.
              </div>
            )}
            {loading &&
              [1, 2].map((key) => (
                <div
                  key={key}
                  className="flex-1 animate-pulse rounded-3xl border border-[#E5E7EB] bg-gradient-to-r from-[#F8FAFC] via-[#F1F5F9] to-[#F8FAFC] p-5"
                />
              ))}
            {!loading &&
              upNext.map((run) => {
                const state = normalizeSortingState(run.raw.sortingState);
                return (
                  <div
                    key={run.id}
                    className="flex-1 rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-5 text-sm text-[#4B5563]"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[#181B31]">{run.title}</p>
                      <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 ${statusTone[state]}`}>
                        {statusIcon[state]}
                        {state === "PROCESSING" ? "Running" : "Pending"}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-[#8A94A6]">
                      Updated {run.updated} · {run.shortlist} shortlisted so far
                    </p>
                  </div>
                );
              })}
          </div>
        </div>
      </section>
    </div>
  );
}
