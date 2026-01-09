"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Activity, AlertTriangle, ArrowRight, BarChart, CheckCircle2, Clock3, FileText, Gauge, Trash2 } from "lucide-react";
import { Pagination } from "@/app/components/Pagination";

const stats = [
  {
    label: "Active jobs",
    value: "12",
    helper: "Upload → Scoring",
    tone: "from-primary-500/20 via-primary-500/10 to-transparent",
    icon: Activity,
  },
  {
    label: "CVs processing",
    value: "2,418",
    helper: "Today",
    tone: "from-emerald-500/20 via-emerald-500/10 to-transparent",
    icon: Gauge,
  },
  {
    label: "Failures (24h)",
    value: "18",
    helper: "OCR/Parser/LLM",
    tone: "from-amber-500/20 via-amber-500/10 to-transparent",
    icon: AlertTriangle,
  },
  {
    label: "Latency",
    value: "18s / 46s",
    helper: "p50 / p95",
    tone: "from-fuchsia-500/20 via-fuchsia-500/10 to-transparent",
    icon: Clock3,
  },
];

const jobs = [
  { title: "Frontend Engineer", id: "job-2418", resumes: 184, status: "Scoring", owner: "Riley", created: "2h ago", failures: "0.9%", latency: "18s p50" },
  { title: "Sales Lead", id: "job-2381", resumes: 128, status: "Extraction", owner: "Priya", created: "3h ago", failures: "1.2%", latency: "21s p50" },
  { title: "Data Analyst", id: "job-2376", resumes: 202, status: "Upload", owner: "Amina", created: "5h ago", failures: "0.7%", latency: "16s p50" },
  { title: "Support Specialist", id: "job-2362", resumes: 94, status: "Scoring", owner: "Samir", created: "7h ago", failures: "0.5%", latency: "15s p50" },
  { title: "Product Designer", id: "job-2357", resumes: 76, status: "Completed", owner: "Nora", created: "11h ago", failures: "0.4%", latency: "14s p50" },
];

const stageBars = [
  { label: "Upload", value: 92, color: "bg-primary-400" },
  { label: "OCR", value: 78, color: "bg-amber-400" },
  { label: "Extraction", value: 84, color: "bg-fuchsia-400" },
  { label: "Scoring", value: 73, color: "bg-emerald-400" },
];

export default function JobsPage() {
  const [page, setPage] = useState(1);
  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(jobs.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const pagedJobs = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return jobs.slice(start, start + pageSize);
  }, [safePage, pageSize]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Jobs</p>
          <h1 className="text-2xl font-semibold text-white">Pipeline & job library</h1>
          <p className="text-sm text-slate-400">Watch pipeline health, then dive into each job to view or delete.</p>
        </div>
        <Link
          href="/admin/cv-processing"
          className="inline-flex items-center gap-2 rounded-lg border border-primary-500/50 bg-primary-500/10 px-3 py-2 text-sm font-semibold text-primary-100 transition hover:bg-primary-500/15"
        >
          <BarChart className="h-4 w-4" />
          View pipeline
        </Link>
      </header>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl border border-slate-800 bg-gradient-to-br ${stat.tone} p-4 shadow-[0_20px_60px_-45px_rgba(0,0,0,0.85)]`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">{stat.label}</p>
                <p className="text-2xl font-semibold text-white">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.helper}</p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white ring-1 ring-slate-700">
                <stat.icon className="h-5 w-5" />
              </span>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Job list</p>
              <h2 className="text-lg font-semibold text-white">View or delete jobs</h2>
            </div>
            <CheckCircle2 className="h-5 w-5 text-success-400" />
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/80 text-slate-300">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Job</th>
                  <th className="px-4 py-3 text-left font-semibold">Resumes</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Owner</th>
                  <th className="px-4 py-3 text-left font-semibold">Failures</th>
                  <th className="px-4 py-3 text-left font-semibold">Latency</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {pagedJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-900/60">
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <p className="font-semibold text-white">{job.title}</p>
                        <p className="text-xs text-slate-400">{job.id} · {job.created}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">{job.resumes.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-primary-500/15 px-3 py-1 text-xs font-semibold text-primary-100">
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{job.owner}</td>
                    <td className="px-4 py-3 text-slate-300">{job.failures}</td>
                    <td className="px-4 py-3 text-slate-300">{job.latency}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                        <Link
                          href={`/admin/jobs/${job.id}`}
                          className="rounded-lg border border-primary-500/50 bg-primary-500/10 px-2.5 py-1 text-primary-100 transition hover:bg-primary-500/15"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-lg border border-danger-600/60 bg-danger-500/10 px-2.5 py-1 text-danger-100 transition hover:bg-danger-500/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3">
            <Pagination page={safePage} totalItems={jobs.length} pageSize={pageSize} onPageChange={setPage} variant="dark" />
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Pipeline glance</p>
              <h2 className="text-lg font-semibold text-white">Per-stage flow</h2>
            </div>
            <FileText className="h-5 w-5 text-primary-200" />
          </div>
          <div className="space-y-2">
            {stageBars.map((stage) => (
              <div key={stage.label} className="space-y-1 rounded-lg border border-slate-800 bg-slate-900/70 p-3">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>{stage.label}</span>
                  <span className="font-semibold text-white">{stage.value}% healthy</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div className={`h-full rounded-full ${stage.color}`} style={{ width: `${stage.value}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3 text-xs text-slate-300">
            Reprocess failures by stage to avoid re-running the full pipeline.
          </div>
          <Link href="/admin/failed-documents" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-100 hover:text-primary-50">
            Open failure center
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
