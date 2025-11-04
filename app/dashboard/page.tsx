import type { JSX } from 'react';
import Link from 'next/link';
import { PlusCircle, ArrowUpRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
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
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    badge: 'bg-emerald-50 text-emerald-700',
    text: 'Completed',
  },
  processing: {
    icon: <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />,
    badge: 'bg-amber-50 text-amber-700',
    text: 'Processing',
  },
  failed: {
    icon: <AlertCircle className="w-4 h-4 text-rose-500" />,
    badge: 'bg-rose-50 text-rose-700',
    text: 'Failed',
  },
};

const quickStats = [
  { label: 'Jobs Processed This Week', value: '12', trend: '+3 vs last week' },
  { label: 'CVs Analyzed', value: '378', trend: '47 today' },
  { label: 'Average Match Score', value: '82%', trend: '+4% vs last job' },
];

export default function DashboardPage() {
  return (
    <Layout>
      <div className="space-y-10">
        <section className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Welcome back, Rafid</h1>
            <p className="mt-2 text-sm text-gray-600">
              Upload a new role or review the latest results. Your AI recruiter has been busy.
            </p>
          </div>
          <Link
            href="/job/new"
            className="inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            New Job
          </Link>
        </section>

        <section className="grid gap-5 sm:grid-cols-3">
          {quickStats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="mt-3 text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p className="mt-1 text-xs font-medium text-primary-600">{stat.trend}</p>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Jobs</h2>
              <p className="text-sm text-gray-500">Last 30 days of processing activity.</p>
            </div>
            <Link href="/history" className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700">
              View history
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <ul className="divide-y divide-gray-200">
            {recentJobs.map((job) => {
              const status = statusStyles[job.status];
              return (
                <li key={job.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-semibold text-gray-900">{job.title}</h3>
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${status.badge}`}>
                          {status.icon}
                          {status.text}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">Job ID • {job.id}</p>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div>
                        <p className="font-medium text-gray-900">{job.processedCount}</p>
                        <p className="text-xs text-gray-500">CVs processed</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{job.totalCount}</p>
                        <p className="text-xs text-gray-500">Total uploaded</p>
                      </div>
                      <Link
                        href={`/results/${job.id}`}
                        className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
                      >
                        View results
                        <ArrowUpRight className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </Layout>
  );
}
