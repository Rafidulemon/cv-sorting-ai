"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Sparkles, Timer, TrendingUp } from "lucide-react";
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

const timeSavingsData = [
  { label: "Mon", minutes: 42 },
  { label: "Tue", minutes: 55 },
  { label: "Wed", minutes: 63 },
  { label: "Thu", minutes: 71 },
  { label: "Fri", minutes: 64 },
  { label: "Sat", minutes: 38 },
  { label: "Sun", minutes: 46 },
];

const successRateData = [
  { label: "Week 1", value: 82 },
  { label: "Week 2", value: 86 },
  { label: "Week 3", value: 89 },
  { label: "Week 4", value: 93 },
];

const maxTimeSaved = Math.max(...timeSavingsData.map((item) => item.minutes));

export default function DashboardPage() {
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [recentJobs, setRecentJobs] = useState<JobSummary[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const [jobsRes, candidatesRes] = await Promise.all([
          fetch("/api/jobs", { cache: "no-store" }),
          fetch("/api/candidates", { cache: "no-store" }),
        ]);

        const jobsPayload = await jobsRes.json();
        const candidatePayload = await candidatesRes.json();

        if (!jobsRes.ok) throw new Error(jobsPayload?.error ?? "Failed to load jobs");
        if (!candidatesRes.ok) throw new Error(candidatePayload?.error ?? "Failed to load candidates");

        const apiJobs = Array.isArray(jobsPayload?.jobs) ? (jobsPayload.jobs as ApiJob[]) : [];
        const mappedJobs = apiJobs.map(mapJobToSummary);
        setJobs(mappedJobs);
        setRecentJobs(mappedJobs.slice(0, 3));

        const apiCandidates = Array.isArray(candidatePayload?.candidates)
          ? (candidatePayload.candidates as Candidate[])
          : [];
        setCandidates(apiCandidates);
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
    const shortlisted = jobs.reduce((sum, job) => sum + (job.shortlist ?? 0), 0);
    return [
      { label: "Active jobs", value: String(active), helper: "Running screenings", gradient: "from-[#ffe2f1] via-[#fff5fb] to-white" },
      { label: "Candidates", value: String(totalCandidates || 0), helper: "In your pipeline", gradient: "from-[#e9e8ff] via-[#f3f2ff] to-white" },
      { label: "Shortlisted", value: String(shortlisted || 0), helper: "Top matches surfaced", gradient: "from-[#f3e4ff] via-[#f9f2ff] to-white" },
      { label: "Avg. time saved", value: "58%", helper: "Vs manual screening", gradient: "from-[#e2f5ff] via-[#f0faff] to-white" },
    ];
  }, [jobs, candidates]);

  const candidateList = candidates.slice(0, 5);

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
            <h1 className="text-3xl font-semibold leading-tight text-[#1f2a44] sm:text-4xl">Welcome back, Rafid</h1>
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
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-[#f5f0ff] p-2 text-primary-500">
                    <Timer className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#1f2a44]">AI time saved</h3>
                    <p className="text-sm text-[#8a90a6]">Vs manual CV review (per day)</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-[#1f2a44]">12.4h</p>
                  <p className="text-xs text-[#8a90a6]">saved this week</p>
                </div>
              </div>
              <div className="flex items-end gap-3 rounded-2xl border border-white/70 bg-gradient-to-b from-[#f7f2fb] to-white p-3">
                {timeSavingsData.map((item) => (
                  <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-28 w-full items-end rounded-lg bg-white/60 p-1 shadow-inner">
                      <div
                        className="w-full rounded-lg bg-gradient-to-t from-[#f3b5d6] via-[#b294ff] to-[#7c5dfa]"
                        style={{ height: `${(item.minutes / maxTimeSaved) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-[#8a90a6]">{item.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#8a90a6]">AI auto-sorting trims repetitive screening and gives recruiters their time back.</p>
            </div>

            <div className="space-y-4 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl bg-[#fff3f9] p-2 text-[#f06292]">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#1f2a44]">Success rate</h3>
                    <p className="text-sm text-[#8a90a6]">Shortlisted → interview-ready candidates</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-[#1f2a44]">93%</p>
                  <p className="text-xs text-[#8a90a6]">+4.1% vs last cycle</p>
                </div>
              </div>
              <div className="space-y-2 rounded-2xl border border-white/70 bg-gradient-to-b from-[#f0f5ff] via-white to-white p-3">
                {successRateData.map((point) => (
                  <div key={point.label} className="flex items-center gap-3">
                    <span className="w-16 text-xs font-semibold text-[#1f2a44]">{point.label}</span>
                    <div className="flex-1 overflow-hidden rounded-full bg-[#f0e8f7]">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-[#7c5dfa] via-[#9c6cf8] to-[#f06292]"
                        style={{ width: `${point.value}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-xs font-semibold text-[#1f2a44]">{point.value}%</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#8a90a6]">Quality stays high as the CV sorter prioritizes signals that match your JD.</p>
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

        <section className="flex flex-col gap-4 rounded-[28px] border border-white/60 bg-white/80 p-5 shadow-card-soft backdrop-blur xl:p-6">
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
            href="/candidates"
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-500 to-[#f06292] px-4 py-3 text-sm font-semibold text-white shadow-[0_20px_45px_-22px_rgba(216,8,128,0.55)] transition hover:translate-y-[-2px]"
          >
            <CheckCircle2 className="h-4 w-4" />
            Upload &amp; Screen Now
          </Link>
          <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#efe7f5] bg-white px-4 py-3 text-sm font-semibold text-[#8a90a6] shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:text-primary-500">
            Import from ATS
            <ArrowRight className="h-4 w-4" />
          </button>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c1c5d6]">Coming soon</p>
        </section>
      </div>
    </div>
  );
}
