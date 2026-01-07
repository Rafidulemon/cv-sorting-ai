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
  FileSearch,
  Sparkles,
} from 'lucide-react';
import type { Job } from '../../types';

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
    icon: <CheckCircle2 className="h-4 w-4 text-success-400" />,
    badge: 'border border-success-500/30 bg-success-500/10 text-success-200',
    text: 'Completed',
  },
  processing: {
    icon: <Loader2 className="h-4 w-4 animate-spin text-warning-400" />,
    badge: 'border border-warning-500/30 bg-warning-500/10 text-warning-200',
    text: 'Processing',
  },
  failed: {
    icon: <AlertCircle className="h-4 w-4 text-danger-400" />,
    badge: 'border border-danger-500/30 bg-danger-500/10 text-danger-200',
    text: 'Failed',
  },
};

const quickStats: Array<{
  label: string;
  value: string;
  trend: string;
  icon: typeof BarChart3;
  accent: string;
  borderClass: string;
  iconBg: string;
  iconColor: string;
}> = [
  {
    label: 'Jobs processed this week',
    value: '12',
    trend: '+3 vs last week',
    icon: BarChart3,
    accent: 'from-[#38BDF8]/15 via-transparent to-transparent',
    borderClass: 'border-[#12233E]',
    iconBg: 'bg-[#0A1628]',
    iconColor: 'text-[#38BDF8]',
  },
  {
    label: 'CVs analyzed',
    value: '378',
    trend: '47 today',
    icon: Users2,
    accent: 'from-[#38BDF8]/12 via-transparent to-transparent',
    borderClass: 'border-[#12233E]',
    iconBg: 'bg-[#0A1628]',
    iconColor: 'text-[#38BDF8]',
  },
  {
    label: 'Average match score',
    value: '82%',
    trend: '+4% vs last job',
    icon: Sparkles,
    accent: 'from-[#38BDF8]/12 via-transparent to-transparent',
    borderClass: 'border-[#12233E]',
    iconBg: 'bg-[#0A1628]',
    iconColor: 'text-[#38BDF8]',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-10 text-[#DCE8FA]">
      <section className="relative overflow-hidden rounded-4xl border border-[#12233E]/80 bg-gradient-to-br from-[#0A1628] via-[#050B16] to-[#0A1628] p-8 shadow-card-soft">
        <div className="pointer-events-none absolute inset-0 opacity-80">
          <div className="absolute -top-20 right-10 h-56 w-56 rounded-full bg-[#38BDF8]/15 blur-3xl" />
          <div className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-[#38BDF8]/12 blur-3xl" />
        </div>
        <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#38BDF8]/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#38BDF8]">
              <Sparkles className="h-4 w-4 text-[#38BDF8]" />
              Intelligent hiring workspace
            </span>
            <h1 className="text-3xl font-semibold leading-tight text-[#DCE8FA] md:text-4xl">Welcome back, Rafid</h1>
            <p className="text-sm text-[#7F93AE] md:text-base">
              Your AI recruiter prioritized the latest candidate cohorts. Review insights or launch a new role to keep
              your pipeline moving.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/job/new"
              className="inline-flex items-center justify-center rounded-full bg-[#38BDF8] px-5 py-3 text-sm font-semibold text-[#050B16] transition hover:bg-[#0EA5E9]"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Create new job
            </Link>
            <Link
              href="/cv/analyze"
              className="inline-flex items-center justify-center rounded-full border border-[#38BDF8]/40 bg-[#38BDF8]/15 px-5 py-3 text-sm font-semibold text-[#38BDF8] transition hover:bg-[#38BDF8]/20"
            >
              <FileSearch className="mr-2 h-5 w-5" />
              Analyze single CV
            </Link>
            <Link
              href="/history"
              className="inline-flex items-center justify-center rounded-full border border-[#12233E] bg-[#0A1628] px-5 py-3 text-sm font-semibold text-[#DCE8FA] transition hover:bg-[#0B182B]"
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
              className={`relative overflow-hidden rounded-3xl border ${stat.borderClass} bg-[#0A1628] p-6 shadow-card-soft`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.accent}`} />
              <div className="relative space-y-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-[#12233E] ${stat.iconBg} ${stat.iconColor}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#4F627D]">{stat.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-[#DCE8FA]">{stat.value}</p>
                  <p className="mt-1 text-sm text-[#4F627D]">{stat.trend}</p>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="relative overflow-hidden rounded-4xl border border-[#12233E] bg-[#0A1628] shadow-card-soft">
        <div className="pointer-events-none absolute -top-20 right-6 h-52 w-52 rotate-12 rounded-full bg-[#38BDF8]/15 blur-3xl" />
        <div className="relative">
          <div className="flex flex-col gap-4 border-b border-[#12233E] px-6 py-6 sm:flex-row sm:items-center sm:justify-between md:px-8">
            <div>
              <h2 className="text-lg font-semibold text-[#DCE8FA]">Recent jobs</h2>
              <p className="text-sm text-[#4F627D]">Last 30 days of processing activity.</p>
            </div>
            <Link
              href="/history"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#38BDF8] transition hover:text-[#38BDF8]"
            >
              View history
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="divide-y divide-[#12233E]">
            {recentJobs.map((job) => {
              const status = statusStyles[job.status];
              return (
                <li key={job.id} className="px-6 py-5 transition hover:bg-[#0B182B] md:px-8">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-base font-semibold text-[#DCE8FA]">{job.title}</h3>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${status.badge}`}
                        >
                          {status.icon}
                          {status.text}
                        </span>
                      </div>
                      <p className="text-sm text-[#4F627D]">Job ID: {job.id}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-6 text-sm text-[#4F627D]">
                      <div>
                        <p className="text-base font-semibold text-[#DCE8FA]">{job.processedCount}</p>
                        <p className="text-xs text-[#4F627D]">CVs processed</p>
                      </div>
                      <div>
                        <p className="text-base font-semibold text-[#DCE8FA]">{job.totalCount}</p>
                        <p className="text-xs text-[#4F627D]">Total uploaded</p>
                      </div>
                      <Link
                        href={`/results/${job.id}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-[#38BDF8] transition hover:text-[#38BDF8]"
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
  );
}
