"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, Sparkles } from "lucide-react";
import type { ApiJob, JobSummary } from "../jobs/data";
import { mapJobToSummary } from "../jobs/data";

type Candidate = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  headline: string | null;
  source: string | null;
  createdAt: string;
  tags: string[];
};

const statusTone: Record<string, string> = {
  Active: "from-[#34d399] to-[#16a34a]",
  Reviewing: "from-[#fcd34d] to-[#f59e0b]",
  Draft: "from-[#f9a8d4] to-[#ec4899]",
  Completed: "from-[#a5b4fc] to-[#6366f1]",
};

type ResumeSummary = {
  statusCounts: Record<string, number>;
  dailyTimeSaved: { date: string; completed: number }[];
  monthlySuccess: { month: string; completed: number; total: number; successRate: number }[];
  avgSortSeconds: number | null;
  totalSorted: number;
};

const resumeStatusColor: Record<string, string> = {
  UPLOADED: "from-[#c4d4ff] to-[#7ea5ff]",
  PARSING: "from-[#fde68a] to-[#f59e0b]",
  EMBEDDING: "from-[#a7f3d0] to-[#34d399]",
  SCORING: "from-[#f9a8d4] to-[#ec4899]",
  COMPLETED: "from-[#c7d2fe] to-[#6366f1]",
  FAILED: "from-[#fecdd3] to-[#f87171]",
};

function formatAvgSeconds(value: number | null) {
  if (value == null) return "—";
  if (value >= 60) {
    const minutes = Math.floor(value / 60);
    const seconds = Math.round(value % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}m`;
  }
  return `${Math.round(value)}s`;
}

export default function DashboardPage() {
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [recentJobs, setRecentJobs] = useState<JobSummary[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [resumeSummary, setResumeSummary] = useState<ResumeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const [jobsRes, candidatesRes, resumeSummaryRes] = await Promise.all([
          fetch("/api/jobs", { cache: "no-store" }),
          fetch("/api/candidates", { cache: "no-store" }),
          fetch("/api/resumes/summary", { cache: "no-store" }),
        ]);

        const jobsPayload = await jobsRes.json();
        const candidatePayload = await candidatesRes.json();
        const resumeSummaryPayload = await resumeSummaryRes.json();

        if (!jobsRes.ok) throw new Error(jobsPayload?.error ?? "Failed to load jobs");
        if (!candidatesRes.ok) throw new Error(candidatePayload?.error ?? "Failed to load candidates");
        if (!resumeSummaryRes.ok) throw new Error(resumeSummaryPayload?.error ?? "Failed to load resume summary");

        const apiJobs = Array.isArray(jobsPayload?.jobs) ? (jobsPayload.jobs as ApiJob[]) : [];
        const mappedJobs = apiJobs.map(mapJobToSummary);
        setJobs(mappedJobs);
        setRecentJobs(mappedJobs.slice(0, 3));

        const apiCandidates = Array.isArray(candidatePayload?.candidates)
          ? (candidatePayload.candidates as Candidate[])
          : [];
        setCandidates(apiCandidates);

        setResumeSummary(resumeSummaryPayload as ResumeSummary);
      } catch (err) {
        setError((err as Error)?.message ?? "Unable to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const statCards = useMemo(() => {
    const active = jobs.filter((job) => job.status === "Active").length;
    const totalCandidates = candidates.length;
    const avgSortSeconds = resumeSummary?.avgSortSeconds ?? null;
    return [
      { label: "Active jobs", value: String(active), helper: "Running screenings", gradient: "from-[#ffe2f1] via-[#fff5fb] to-white" },
      { label: "Total jobs", value: String(jobs.length), helper: "Across your org", gradient: "from-[#e9e8ff] via-[#f3f2ff] to-white" },
      { label: "Candidates", value: String(totalCandidates || 0), helper: "In your pipeline", gradient: "from-[#f3e4ff] via-[#f9f2ff] to-white" },
      {
        label: "Shortlist rate",
        value: formatAvgSeconds(avgSortSeconds),
        helper: "Avg sorting time per resume",
        gradient: "from-[#e2f5ff] via-[#f0faff] to-white",
      },
    ];
  }, [jobs, candidates, resumeSummary]);

  const candidateList = candidates.slice(0, 5);
  const pipeline = useMemo(() => {
    const entries = Object.entries(resumeSummary?.statusCounts ?? {});
    const total = entries.reduce((sum, [, count]) => sum + count, 0);
    return entries.map(([status, count]) => {
      const pct = total ? Math.round((count / total) * 100) : 0;
      return {
        label: status.replaceAll("_", " "),
        value: count,
        pct,
        color: resumeStatusColor[status] ?? "from-[#e5e7eb] to-[#d1d5db]",
      };
    });
  }, [resumeSummary]);

  const timeSaved = useMemo(() => {
    const points = resumeSummary?.dailyTimeSaved ?? [];
    const mapped = points.map((p) => ({
      label: new Date(p.date).toLocaleDateString(undefined, { weekday: "short" }),
      minutes: p.completed * 2,
    }));
    const max = mapped.length ? Math.max(...mapped.map((p) => p.minutes)) || 1 : 1;
    return { points: mapped, max };
  }, [resumeSummary]);

  const successMonthly = resumeSummary?.monthlySuccess ?? [];
  const totalMinutesSaved = timeSaved.points.reduce((sum, p) => sum + p.minutes, 0);
  const barTransition = "transition-all duration-500 ease-out";

  return (
    <div className="space-y-6 text-[#1f2a44]">
      {error && (
        <div className="rounded-3xl border border-[#F59E0B] bg-[#FFF7E6] px-4 py-3 text-sm text-[#92400E] shadow-sm">
          {error}
        </div>
      )}
      <section className="relative overflow-hidden rounded-[28px] border border-white/60 bg-white/80 p-6 shadow-card-soft backdrop-blur sm:p-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-10 top-6 h-32 w-32 rounded-full bg-[#f7e2f3] blur-3xl" />
          <div className="absolute -left-6 bottom-0 h-36 w-36 rounded-full bg-[#e2e7ff] blur-3xl" />
          <div className="absolute inset-x-10 top-10 h-24 rounded-full bg-gradient-to-r from-primary-100/70 via-transparent to-[#e0e7ff]/80 blur-[90px]" />
        </div>
        <div className="relative space-y-6">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-500">Welcome back</p>
            <h1 className="text-3xl font-semibold leading-tight text-[#1f2a44] sm:text-4xl">Welcome back</h1>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {statCards.map((stat) => (
              <div
                key={stat.label}
                className={`relative overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-r ${stat.gradient} p-4 shadow-sm`}
              >
                <div className="flex flex-col gap-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a90a6]">{stat.label}</p>
                  <p className="text-3xl font-semibold text-[#1f2a44]">{stat.value}</p>
                  <p className="text-sm text-[#8a90a6]">{stat.helper}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="space-y-6 rounded-[28px] border border-white/60 bg-white/80 p-5 shadow-card-soft backdrop-blur xl:col-span-2 xl:p-6">
          

          <div className="grid gap-4 rounded-2xl border border-white/70 bg-gradient-to-br from-[#fdf2ff] via-white to-[#eaf5ff] p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a90a6]">Pipeline snapshot</p>
                <h3 className="text-lg font-semibold text-[#1f2a44]">Where candidates sit today</h3>
              </div>
              <Sparkles className="h-5 w-5 text-[#7c5dfa]" />
            </div>
            <div className="space-y-3">
              {pipeline.map((row) => (
                <div key={row.label} className="space-y-1 rounded-xl border border-white/70 bg-white/80 p-3 shadow-inner">
                  <div className="flex items-center justify-between text-sm text-[#1f2a44]">
                    <span className="font-semibold">{row.label}</span>
                    <span className="text-xs text-[#6b7280]">{row.value} candidates</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#eef2f7]">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${row.color} ${barTransition}`}
                      style={{ width: `${Math.max(4, row.pct)}%` }}
                    />
                  </div>
                </div>
              ))}
              {!pipeline.length && <p className="text-sm text-[#8a90a6]">No resumes yet.</p>}
            </div>
            <div className="flex items-end gap-2 rounded-xl border border-white/70 bg-white/90 p-3">
              {pipeline.map((row) => (
                <div key={row.label} className="flex-1 space-y-1 text-center">
                  <div className="flex h-20 items-end rounded-lg bg-[#f8f7fb] p-1">
                    <div
                      className={`w-full rounded-md bg-gradient-to-t ${row.color} ${barTransition}`}
                      style={{ height: `${Math.max(6, row.pct)}%` }}
                    />
                  </div>
                  <p className="text-[11px] font-semibold text-[#6b7280]">{row.label}</p>
                  <p className="text-[11px] text-[#9ca3af]">{row.pct}%</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-[#f5f0ff] p-2 text-primary-500">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#1f2a44]">AI time saved</h3>
                    <p className="text-sm text-[#8a90a6]">Based on completed resumes (2 mins manual each)</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-[#1f2a44]">
                    {timeSaved.points.length ? `${Math.round(totalMinutesSaved / 60)}h` : "—"}
                  </p>
                  <p className="text-xs text-[#8a90a6]">last 7 days</p>
                </div>
              </div>
              <div className="flex items-end gap-3 rounded-2xl border border-white/70 bg-gradient-to-b from-[#f7f2fb] to-white p-3">
                {timeSaved.points.map((item) => (
                  <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-28 w-full items-end rounded-lg bg-white/60 p-1 shadow-inner">
                      <div
                        className={`w-full rounded-lg bg-gradient-to-t from-[#f3b5d6] via-[#b294ff] to-[#7c5dfa] ${barTransition}`}
                        style={{ height: `${timeSaved.max ? (item.minutes / timeSaved.max) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[#8a90a6]">{item.label}</span>
                  </div>
                ))}
                {!timeSaved.points.length && <p className="text-sm text-[#8a90a6]">No completed resumes yet.</p>}
              </div>
              <p className="text-xs text-[#8a90a6]">AI sorting offsets manual review time across your uploads.</p>
            </div>

            <div className="space-y-4 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-[#fff3f9] p-2 text-[#f06292]">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#1f2a44]">Success rate</h3>
                    <p className="text-sm text-[#8a90a6]">Monthly completed vs total resumes</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 rounded-2xl border border-white/70 bg-gradient-to-b from-[#f0f5ff] via-white to-white p-3">
                {successMonthly.map((point) => (
                  <div key={point.month} className="flex items-center gap-3">
                    <span className="w-16 text-xs font-semibold text-[#1f2a44]">{point.month}</span>
                    <div className="flex-1 overflow-hidden rounded-full bg-[#f0e8f7]">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r from-[#7c5dfa] via-[#9c6cf8] to-[#f06292] ${barTransition}`}
                        style={{ width: `${Math.min(100, point.successRate)}%` }}
                      />
                    </div>
                    <span className="w-20 text-right text-xs font-semibold text-[#1f2a44]">
                      {point.successRate}% ({point.completed}/{point.total || 0})
                    </span>
                  </div>
                ))}
                {!successMonthly.length && <p className="text-sm text-[#8a90a6]">No resume activity yet.</p>}
              </div>
              <p className="text-xs text-[#8a90a6]">Tracks how many resumes complete scoring each month.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-[#1f2a44]">Recent Screening Jobs</h2>
              <p className="text-sm text-[#8a90a6]">Latest uploads and status.</p>
            </div>
            <Link href="/jobs" className="text-sm font-semibold text-primary-500 transition hover:text-primary-600">
              See all
            </Link>
          </div>

          <div className="space-y-3">
            {loading && <p className="text-sm text-[#8a90a6]">Loading jobs...</p>}
            {!loading && !recentJobs.length && <p className="text-sm text-[#8a90a6]">No jobs available yet.</p>}
            {recentJobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/90 p-4 text-[#1f2a44] shadow-sm transition hover:border-primary-100 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#f6f0ff] to-[#fdf2f8] text-[#1f2a44]">
                    <Sparkles className="h-5 w-5 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-[#1f2a44]">{job.title}</p>
                    <p className="text-sm text-[#8a90a6]">Shortlist {job.shortlist}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`inline-flex min-w-[88px] justify-center rounded-full bg-gradient-to-r ${
                      statusTone[job.status] ?? "from-[#e5e7eb] to-[#d1d5db]"
                    } px-3 py-1 text-xs font-semibold text-white shadow-sm`}
                  >
                    {job.status}
                  </div>
                  <div className="rounded-xl bg-[#f6f1fb] px-3 py-2 text-xs font-semibold text-[#8a90a6]">
                    Updated {job.updated}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#1f2a44]">Top Candidates</h3>
                <p className="text-sm text-[#8a90a6]">Newest candidates in your org.</p>
              </div>
              <Link
                href="/history"
                className="hidden text-sm font-semibold text-primary-500 transition hover:text-primary-600 sm:block"
              >
                See all
              </Link>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-white/70">
              <div className="grid grid-cols-5 bg-[#f7f2fb] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#8a90a6]">
                <span className="col-span-2">Candidate</span>
                <span>Tags</span>
                <span>Source</span>
                <span className="text-right">Added</span>
              </div>
              <div className="divide-y divide-[#f0e8f7] bg-white">
                {candidateList.map((candidate) => (
                  <div key={candidate.id} className="grid grid-cols-5 items-center px-4 py-3 text-sm text-[#1f2a44]">
                    <div className="col-span-2 flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#eef2ff] to-[#fde7f3] text-sm font-bold text-[#1f2a44] shadow-sm">
                        {candidate.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{candidate.fullName}</p>
                        <p className="text-xs text-[#6B7280]">{candidate.headline ?? candidate.location ?? "Candidate"}</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex flex-wrap gap-1">
                        {(candidate.tags ?? []).slice(0, 3).map((tag) => (
                          <span key={tag} className="rounded-full bg-[#f6f1fb] px-2 py-0.5 text-[11px] font-semibold text-[#8a90a6]">
                            {tag}
                          </span>
                        ))}
                        {!candidate.tags?.length && <span className="text-xs text-[#9CA3AF]">—</span>}
                      </div>
                    </div>
                    <div className="text-[#8a90a6]">{candidate.source ?? "—"}</div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#f6f1fb] px-3 py-1 text-xs font-semibold text-[#8a90a6]">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(candidate.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
                {!candidateList.length && (
                  <div className="px-4 py-3 text-sm text-[#8a90a6]">No candidates yet.</div>
                )}
              </div>
            </div>
            <p className="mt-3 text-xs text-[#8a90a6]">Tip: Click “Open” to view scoring explanation &amp; resume highlights.</p>
          </div>
        </section>

        <section className="h-fit flex flex-col gap-4 rounded-[28px] border border-white/60 bg-white/80 p-5 shadow-card-soft backdrop-blur xl:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-500">Start a new shortlist</p>
            <h3 className="text-2xl font-semibold text-[#1f2a44]">Add your role and upload CVs</h3>
            <p className="text-sm text-[#8a90a6]">Bulk upload and let AI screen instantly.</p>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-white/70 bg-gradient-to-r from-[#ffe7f5] to-[#fff7fb] p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-white text-primary-500 shadow-sm">1</div>
                <div>
                  <p className="text-sm font-semibold text-[#1f2a44]">Add Job Description</p>
                  <p className="text-sm text-[#8a90a6]">Paste JD or upload PDF/DOCX.</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/70 bg-gradient-to-r from-[#f0f5ff] to-white p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-white text-[#3D64FF] shadow-sm">2</div>
                <div>
                  <p className="text-sm font-semibold text-[#1f2a44]">Upload CVs</p>
                  <p className="text-sm text-[#8a90a6]">Bulk upload and let AI screen instantly.</p>
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/jobs/new"
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 to-[#f06292] px-4 py-3 text-sm font-semibold text-white shadow-[0_20px_45px_-22px_rgba(216,8,128,0.55)] transition hover:translate-y-[-2px]"
          >
            <CheckCircle2 className="h-4 w-4" />
            Upload &amp; Screen Now
          </Link>
        </section>
      </div>
    </div>
  );
}
