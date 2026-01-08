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
    badge: 'border border-success-500/30 bg-success-500/10 text-success-700',
    text: 'Completed',
  },
  processing: {
    icon: <Loader2 className="h-4 w-4 animate-spin text-warning-400" />,
    badge: 'border border-warning-500/30 bg-warning-500/10 text-warning-700',
    text: 'Processing',
  },
  failed: {
    icon: <AlertCircle className="h-4 w-4 text-danger-400" />,
    badge: 'border border-danger-500/30 bg-danger-500/10 text-danger-700',
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
    accent: 'from-[#3D64FF]/15 via-transparent to-transparent',
    borderClass: 'border-[#DCE0E0]',
    iconBg: 'bg-[#FFFFFF]',
    iconColor: 'text-[#3D64FF]',
  },
  {
    label: 'CVs analyzed',
    value: '378',
    trend: '47 today',
    icon: Users2,
    accent: 'from-[#3D64FF]/12 via-transparent to-transparent',
    borderClass: 'border-[#DCE0E0]',
    iconBg: 'bg-[#FFFFFF]',
    iconColor: 'text-[#3D64FF]',
  },
  {
    label: 'Average match score',
    value: '82%',
    trend: '+4% vs last job',
    icon: Sparkles,
    accent: 'from-[#3D64FF]/12 via-transparent to-transparent',
    borderClass: 'border-[#DCE0E0]',
    iconBg: 'bg-[#FFFFFF]',
    iconColor: 'text-[#3D64FF]',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-10 text-[#181B31]">
      <section className="relative overflow-hidden rounded-4xl border border-[#DCE0E0]/80 bg-gradient-to-br from-[#FFFFFF] via-[#F2F4F8] to-[#FFFFFF] p-8 shadow-card-soft">
        <div className="pointer-events-none absolute inset-0 opacity-80">
          <div className="absolute -top-20 right-10 h-56 w-56 rounded-full bg-[#3D64FF]/15 blur-3xl" />
          <div className="absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-[#3D64FF]/12 blur-3xl" />
        </div>
        <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#3D64FF]/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#3D64FF]">
              <Sparkles className="h-4 w-4 text-[#3D64FF]" />
              Intelligent hiring workspace
            </span>
            <h1 className="text-3xl font-semibold leading-tight text-[#181B31] md:text-4xl">Welcome back, Rafid</h1>
            <p className="text-sm text-[#4B5563] md:text-base">
              Your AI recruiter prioritized the latest candidate cohorts. Review insights or launch a new role to keep
              your pipeline moving.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/job/new"
              className="inline-flex items-center justify-center rounded-full bg-[#3D64FF] px-5 py-3 text-sm font-semibold text-[#FFFFFF] transition hover:bg-[#4F72FF]"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Create new job
            </Link>
            <Link
              href="/cv/analyze"
              className="inline-flex items-center justify-center rounded-full border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-5 py-3 text-sm font-semibold text-[#3D64FF] transition hover:bg-[#3D64FF]/20"
            >
              <FileSearch className="mr-2 h-5 w-5" />
              Analyze single CV
            </Link>
            <Link
              href="/history"
              className="inline-flex items-center justify-center rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-5 py-3 text-sm font-semibold text-[#181B31] transition hover:bg-[#F0F2F8]"
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
              className={`relative overflow-hidden rounded-3xl border ${stat.borderClass} bg-[#FFFFFF] p-6 shadow-card-soft`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.accent}`} />
              <div className="relative space-y-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-[#DCE0E0] ${stat.iconBg} ${stat.iconColor}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#8A94A6]">{stat.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-[#181B31]">{stat.value}</p>
                  <p className="mt-1 text-sm text-[#8A94A6]">{stat.trend}</p>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="relative overflow-hidden rounded-4xl border border-[#DCE0E0] bg-[#FFFFFF] shadow-card-soft">
        <div className="pointer-events-none absolute -top-20 right-6 h-52 w-52 rotate-12 rounded-full bg-[#3D64FF]/15 blur-3xl" />
        <div className="relative">
          <div className="flex flex-col gap-4 border-b border-[#DCE0E0] px-6 py-6 sm:flex-row sm:items-center sm:justify-between md:px-8">
            <div>
              <h2 className="text-lg font-semibold text-[#181B31]">Recent jobs</h2>
              <p className="text-sm text-[#8A94A6]">Last 30 days of processing activity.</p>
            </div>
            <Link
              href="/history"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#3D64FF] transition hover:text-[#3D64FF]"
            >
              View history
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="divide-y divide-[#DCE0E0]">
            {recentJobs.map((job) => {
              const status = statusStyles[job.status];
              return (
                <li key={job.id} className="px-6 py-5 transition hover:bg-[#F0F2F8] md:px-8">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-base font-semibold text-[#181B31]">{job.title}</h3>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${status.badge}`}
                        >
                          {status.icon}
                          {status.text}
                        </span>
                      </div>
                      <p className="text-sm text-[#8A94A6]">Job ID: {job.id}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-6 text-sm text-[#8A94A6]">
                      <div>
                        <p className="text-base font-semibold text-[#181B31]">{job.processedCount}</p>
                        <p className="text-xs text-[#8A94A6]">CVs processed</p>
                      </div>
                      <div>
                        <p className="text-base font-semibold text-[#181B31]">{job.totalCount}</p>
                        <p className="text-xs text-[#8A94A6]">Total uploaded</p>
                      </div>
                      <Link
                        href={`/results/${job.id}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-[#3D64FF] transition hover:text-[#3D64FF]"
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
