import Link from 'next/link';
import { ArrowUpRight, CalendarClock, Clock3, Download, Filter, History as HistoryIcon, Sparkles } from 'lucide-react';

const historyItems = [
  {
    id: 'job-1042',
    role: 'Senior Backend Engineer',
    submitted: '12 Nov · 09:12',
    duration: '6m 24s',
    status: 'Completed',
    highlight: '47 CVs scored · 12 shortlisted',
  },
  {
    id: 'job-1041',
    role: 'Product Designer',
    submitted: '11 Nov · 15:47',
    duration: 'Processing',
    status: 'In progress',
    highlight: '63 CVs queued · 57% complete',
  },
  {
    id: 'job-1036',
    role: 'Data Scientist',
    submitted: '10 Nov · 10:03',
    duration: 'Failed at 82%',
    status: 'Needs attention',
    highlight: 'Retry suggested · data source unreachable',
  },
];

const upcomingJobs = [
  { title: 'AI Research Lead', scheduled: 'Draft ready · awaiting CV upload' },
  { title: 'Growth Marketing Manager', scheduled: 'Interview feedback due tomorrow' },
];

export default function HistoryPage() {
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
                Access logs, exports, and AI insights for completed runs. Filter by status to hone in on the jobs that
                need your attention right now.
              </p>
              <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wide text-[#4B5563]">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-3 py-1.5 text-[#181B31]">
                  <Clock3 className="h-3.5 w-3.5 text-[#3D64FF]" />
                  Average turnaround · 5m 41s
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-3 py-1.5 text-[#181B31]">
                  <Sparkles className="h-3.5 w-3.5 text-[#3D64FF]" />
                  Smart retry suggestions enabled
                </span>
              </div>
            </div>
            <div className="flex w-full flex-col gap-3 rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-5 text-sm text-[#181B31] shadow-card-soft md:w-72">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8A94A6]">Quick export</p>
              <p className="text-lg font-semibold text-[#181B31]">Download full audit</p>
              <p className="text-xs text-[#8A94A6]">Includes CV breakdown, scoring matrix, and ranking rationale.</p>
              <button className="inline-flex items-center justify-center rounded-full border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#3D64FF] transition hover:bg-[#3D64FF]/20">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-[#181B31]">Recent runs</h2>
            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#181B31] transition hover:bg-[#3D64FF]/15 hover:text-[#3D64FF]">
                <Filter className="h-4 w-4 text-[#3D64FF]" />
                Filter status
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#3D64FF] transition hover:bg-[#3D64FF]/20">
                <CalendarClock className="h-4 w-4 text-[#3D64FF]" />
                This month
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {historyItems.map((item) => (
              <div
                key={item.id}
                className="relative overflow-hidden rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-6 text-sm shadow-card-soft"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#3D64FF]/12 via-transparent to-transparent" />
                <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">
                      {item.id}
                      <span className="h-1 w-1 rounded-full bg-[#8A94A6]" />
                      {item.status}
                    </div>
                    <p className="text-base font-semibold text-[#181B31]">{item.role}</p>
                    <p className="text-xs text-[#4B5563]">{item.highlight}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-xs text-[#4B5563] md:text-sm">
                    <div>
                      <p className="font-semibold text-[#181B31]">Submitted</p>
                      <p className="text-[#8A94A6]">{item.submitted}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-[#181B31]">Duration</p>
                      <p className="text-[#8A94A6]">{item.duration}</p>
                    </div>
                    <Link
                      href={`/results/${item.id}`}
                      className="inline-flex items-center gap-2 rounded-full border border-[#DCE0E0] bg-[#FFFFFF] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#3D64FF] transition hover:bg-[#3D64FF]/15"
                    >
                      Review run
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
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
                Draft jobs and upcoming follow-ups so you never lose momentum.
              </p>
            </div>
            <div className="flex flex-1 flex-col gap-4 md:flex-row">
              {upcomingJobs.map((job) => (
                <div
                  key={job.title}
                  className="flex-1 rounded-3xl border border-[#DCE0E0] bg-[#FFFFFF] p-5 text-sm text-[#4B5563]"
                >
                  <p className="text-sm font-semibold text-[#181B31]">{job.title}</p>
                  <p className="mt-2 text-xs text-[#8A94A6]">{job.scheduled}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
    </div>
  );
}
