import type { JSX } from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  ArrowUpRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Users2,
  Sparkles,
} from 'lucide-react';
import Layout from '../components/Layout';
import type { Job } from '../types';

const recentJobs: Array<Job & { processedCount: number; totalCount: number }> = [
  {
    id: 'job-1042',
    title: 'Senior Backend Engineer',
    status: 'completed',
    createdAt: new Date(),
    processedCount: 47,
    totalCount: 47,
  },
  {
    id: 'job-1041',
    title: 'Product Designer',
    status: 'processing',
    createdAt: new Date(),
    processedCount: 18,
    totalCount: 63,
  },
  {
    id: 'job-1036',
    title: 'Data Scientist',
    status: 'failed',
    createdAt: new Date(),
    processedCount: 0,
    totalCount: 52,
  },
];

const statusStyles: Record<Job['status'], { icon: JSX.Element; badge: string; text: string }> = {
  completed: {
    icon: <CheckCircle2 className="h-4 w-4 text-success-300" />,
    badge: 'border border-success-400/40 bg-success-500/15 text-success-100',
    text: 'Completed',
  },
  processing: {
    icon: <Loader2 className="h-4 w-4 animate-spin text-warning-300" />,
    badge: 'border border-warning-400/40 bg-warning-500/15 text-warning-100',
    text: 'Processing',
  },
  failed: {
    icon: <AlertCircle className="h-4 w-4 text-danger-300" />,
    badge: 'border border-danger-400/40 bg-danger-500/15 text-danger-100',
    text: 'Failed',
  },
};

const quickStats: Array<{
  label: string;
  value: string;
  trend: string;
  icon: typeof BarChart3;
  accent: string;
  border: string;
}> = [
  {
    label: 'Jobs processed this week',
    value: '12',
    trend: '+3 vs last week',
    icon: BarChart3,
    accent: 'from-primary-500/25 via-primary-400/15 to-transparent',
    border: 'border-primary-400/40',
  },
  {
    label: 'CVs analyzed',
    value: '378',
    trend: '47 today',
    icon: Users2,
    accent: 'from-accent-500/25 via-accent-400/15 to-transparent',
    border: 'border-accent-400/40',
  },
  {
    label: 'Average match score',
    value: '82%',
    trend: '+4% vs last job',
    icon: Sparkles,
    accent: 'from-success-500/25 via-primary-400/15 to-transparent',
    border: 'border-success-400/40',
  },
];

export default function DashboardPage() {
  return (
    <Layout>
      <div className="space-y-10 text-slate-100">
        <section className="relative overflow-hidden rounded-4xl border border-white/10 bg-gradient-to-br from-primary-700 via-primary-600 to-accent-500 p-8 shadow-glow-primary">
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <div className="absolute -top-20 right-10 h-56 w-56 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          </div>
          <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white/80">
                <Sparkles className="h-4 w-4" />
                Intelligent hiring workspace
              </span>
              <h1 className="text-3xl font-semibold leading-tight text-white md:text-4xl">Welcome back, Rafid</h1>
              <p className="text-sm text-white/80 md:text-base">
                Your AI recruiter prioritized the latest candidate cohorts. Review insights or launch a new role to keep
                your pipeline moving.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/job/new"
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-primary-700 transition hover:bg-slate-100"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Create new job
              </Link>
              <Link
                href="/history"
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/10"
              >
                View activity
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {quickStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`relative overflow-hidden rounded-3xl border ${stat.border} bg-slate-900/60 p-6 shadow-card-soft backdrop-blur`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.accent}`} />
                <div className="relative space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-200/80">{stat.label}</p>
                    <p className="mt-3 text-3xl font-semibold text-white">{stat.value}</p>
                    <p className="mt-1 text-sm text-slate-200/80">{stat.trend}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="relative overflow-hidden rounded-4xl border border-white/10 bg-slate-900/60 shadow-card-soft backdrop-blur">
          <div className="pointer-events-none absolute -top-20 right-6 h-52 w-52 rotate-12 rounded-full bg-primary-500/15 blur-3xl" />
          <div className="relative">
            <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-6 sm:flex-row sm:items-center sm:justify-between md:px-8">
              <div>
                <h2 className="text-lg font-semibold text-white">Recent jobs</h2>
                <p className="text-sm text-slate-300/80">Last 30 days of processing activity.</p>
              </div>
              <Link
                href="/history"
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary-100 transition hover:text-white"
              >
                View history
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <ul className="divide-y divide-white/5">
              {recentJobs.map((job) => {
                const status = statusStyles[job.status];
                return (
                  <li key={job.id} className="px-6 py-5 transition hover:bg-white/5 md:px-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-base font-semibold text-white">{job.title}</h3>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${status.badge}`}
                          >
                            {status.icon}
                            {status.text}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300/80">Job ID: {job.id}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-6 text-sm text-slate-200/80">
                        <div>
                          <p className="text-base font-semibold text-white">{job.processedCount}</p>
                          <p className="text-xs text-slate-400">CVs processed</p>
                        </div>
                        <div>
                          <p className="text-base font-semibold text-white">{job.totalCount}</p>
                          <p className="text-xs text-slate-400">Total uploaded</p>
                        </div>
                        <Link
                          href={`/results/${job.id}`}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-primary-100 transition hover:text-white"
                        >
                          View results
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </div>
    </Layout>
  );
}
