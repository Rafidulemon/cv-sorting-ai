import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Link2,
  PlugZap,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

type IntegrationStatus = "connected" | "beta" | "waitlist";

const statusStyles: Record<
  IntegrationStatus,
  { label: string; className: string; action: string }
> = {
  connected: {
    label: "Connected",
    className: "border-emerald-100 bg-emerald-50 text-emerald-700",
    action: "Manage",
  },
  beta: {
    label: "In beta",
    className: "border-amber-100 bg-amber-50 text-amber-700",
    action: "Join beta",
  },
  waitlist: {
    label: "Waitlist",
    className: "border-[#e5e7eb] bg-[#f8fafc] text-[#6b7280]",
    action: "Request",
  },
};

const jobIntegrations = [
  {
    name: "Greenhouse",
    status: "connected" as IntegrationStatus,
    description: "Harvest API + webhooks for jobs, candidates, and files.",
    accent: "from-[#e2f7f4] to-white",
    chip: "ATS",
  },
  {
    name: "Lever",
    status: "connected" as IntegrationStatus,
    description: "Opportunities + resume sync. Auto-import applications.",
    accent: "from-[#f2ecff] to-white",
    chip: "ATS",
  },
  {
    name: "Workable",
    status: "beta" as IntegrationStatus,
    description: "Partner API with webhook triggers for new applicants.",
    accent: "from-[#fff5f9] to-white",
    chip: "ATS",
  },
  {
    name: "Ashby",
    status: "beta" as IntegrationStatus,
    description: "GraphQL access for roles, stages, and candidate notes.",
    accent: "from-[#e9f2ff] to-white",
    chip: "ATS",
  },
  {
    name: "SmartRecruiters",
    status: "beta" as IntegrationStatus,
    description: "Job + candidate API with attachment ingest.",
    accent: "from-[#f7f2fb] to-white",
    chip: "ATS",
  },
  {
    name: "Indeed",
    status: "waitlist" as IntegrationStatus,
    description: "Publisher API for job distribution. Resume ingest on request.",
    accent: "from-[#f0f5ff] to-white",
    chip: "Job portal",
  },
  {
    name: "LinkedIn Talent",
    status: "waitlist" as IntegrationStatus,
    description: "Talent Solutions partner lanes for synced applicants.",
    accent: "from-[#fff7f2] to-white",
    chip: "Job portal",
  },
  {
    name: "ZipRecruiter",
    status: "waitlist" as IntegrationStatus,
    description: "Employer API for job feeds + applicant intake.",
    accent: "from-[#f8f4ff] to-white",
    chip: "Job portal",
  },
];

const checklist = [
  {
    title: "Pick your source",
    detail: "Choose an ATS or job portal to ingest jobs and CVs.",
    icon: PlugZap,
  },
  {
    title: "Authorize & map fields",
    detail: "Grant access and align candidates, stages, and files.",
    icon: Link2,
  },
  {
    title: "Send data to carriX",
    detail: "Enable webhooks or polling to keep profiles current.",
    icon: Zap,
  },
  {
    title: "Review sync health",
    detail: "Monitor last sync, errors, and skipped attachments.",
    icon: ShieldCheck,
  },
];

export default function IntegrationsPage() {
  return (
    <div className="space-y-6 text-[#1f2a44]">
      <section className="relative overflow-hidden rounded-[28px] border border-white/60 bg-white/80 p-6 shadow-card-soft backdrop-blur sm:p-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-6 top-6 h-32 w-32 rounded-full bg-[#f7e2f3] blur-3xl" />
          <div className="absolute -left-8 bottom-0 h-36 w-36 rounded-full bg-[#e2e7ff] blur-3xl" />
        </div>
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-500">Integrations</p>
            <h1 className="text-3xl font-semibold leading-tight text-[#1f2a44] sm:text-4xl">
              Connect your ATS & job portals
            </h1>
            <p className="max-w-2xl text-sm text-[#8a90a6]">
              Pull jobs, applicants, and CV files directly into carriX. Keep every shortlist in sync and push
              decisions back to your ATS without copy-paste.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-primary-50 px-4 py-2 text-xs font-semibold text-primary-700">
                ATS sync
              </span>
              <span className="rounded-full bg-[#f0f5ff] px-4 py-2 text-xs font-semibold text-[#3D64FF]">
                Job portal intake
              </span>
              <span className="rounded-full bg-[#fff4f8] px-4 py-2 text-xs font-semibold text-[#d80880]">
                Webhook-ready
              </span>
            </div>
          </div>

          <div className="grid w-full max-w-lg grid-cols-2 gap-3 rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur sm:gap-4">
            <div className="flex items-center gap-3 rounded-xl border border-white/70 bg-gradient-to-r from-[#e8f9f3] to-white p-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-white text-emerald-500 shadow-sm">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">Live now</p>
                <p className="text-lg font-semibold text-[#1f2a44]">Greenhouse + Lever</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-white/70 bg-gradient-to-r from-[#fff4f0] to-white p-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-white text-[#f06292] shadow-sm">
                <Clock3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">Queue</p>
                <p className="text-lg font-semibold text-[#1f2a44]">Workable + Ashby</p>
              </div>
            </div>
            <div className="col-span-2 flex items-center justify-between rounded-xl border border-white/70 bg-gradient-to-r from-[#f1f5ff] via-white to-[#fff3f9] p-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-white text-primary-500 shadow-sm">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1f2a44]">Auto-ingestion for every posting</p>
                  <p className="text-xs text-[#8a90a6]">Upload once—candidates flow into carriX with profiles and files.</p>
                </div>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary-500 to-[#f06292] px-3 py-2 text-xs font-semibold text-white shadow-[0_12px_35px_-20px_rgba(216,8,128,0.6)] transition hover:translate-y-[-1px]"
              >
                View playbook
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-[28px] border border-white/60 bg-white/80 p-6 shadow-card-soft backdrop-blur sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-500">Connections</p>
            <h2 className="text-2xl font-semibold text-[#1f2a44]">ATS & job portal integrations</h2>
            <p className="text-sm text-[#8a90a6]">Connect a source to import jobs, applicants, and CV attachments.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-3 py-2 text-xs font-semibold text-[#6b7280] shadow-sm">
            <ShieldCheck className="h-4 w-4 text-[#22c55e]" />
            SOC2-ready data handling
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {jobIntegrations.map((integration) => {
            const status = statusStyles[integration.status];
            return (
              <div
                key={integration.name}
                className={`relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br ${integration.accent} p-5 shadow-sm`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a90a6]">
                      {integration.chip}
                    </div>
                    <h3 className="text-lg font-semibold text-[#1f2a44]">{integration.name}</h3>
                    <p className="text-sm text-[#8a90a6]">{integration.description}</p>
                  </div>
                  <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}>
                    {status.label}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#8a90a6]">
                    <Link2 className="h-4 w-4 text-primary-500" />
                    Webhooks + API
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg border border-white/70 bg-white/90 px-3 py-2 text-sm font-semibold text-[#1f2a44] shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:text-primary-600"
                  >
                    {status.action}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 rounded-[28px] border border-white/60 bg-white/80 p-6 shadow-card-soft backdrop-blur lg:col-span-3 lg:p-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-500">How it works</p>
              <h3 className="text-xl font-semibold text-[#1f2a44]">Set up the integration in minutes</h3>
              <p className="text-sm text-[#8a90a6]">A guided checklist to keep imports and syncs reliable.</p>
            </div>
            <div className="rounded-full bg-[#f6f1fb] px-4 py-2 text-xs font-semibold text-[#8a90a6]">
              CV files, metadata, and notes included
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {checklist.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary-50 to-white text-primary-500 shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#f6f1fb] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a90a6]">
                      Step {index + 1}
                    </div>
                    <h4 className="text-base font-semibold text-[#1f2a44]">{step.title}</h4>
                    <p className="text-sm text-[#8a90a6]">{step.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 rounded-[28px] border border-white/60 bg-white/80 p-6 shadow-card-soft backdrop-blur lg:col-span-2 lg:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-500">Sync health</p>
              <h3 className="text-xl font-semibold text-[#1f2a44]">Monitor imports</h3>
              <p className="text-sm text-[#8a90a6]">Know when CVs land, get alerted on failures.</p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#e8f9f3] text-emerald-500">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-white/70 bg-gradient-to-b from-[#f3f6ff] via-white to-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-sm font-semibold text-[#1f2a44]">Last sync</span>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                2 minutes ago
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-[#8a90a6]">
              <span>Documents ingested</span>
              <span className="font-semibold text-[#1f2a44]">42</span>
            </div>
            <div className="flex items-center justify-between text-sm text-[#8a90a6]">
              <span>Attachments skipped</span>
              <span className="font-semibold text-[#f97316]">1 (missing file)</span>
            </div>
            <div className="flex items-center justify-between text-sm text-[#8a90a6]">
              <span>Next scheduled sync</span>
              <span className="font-semibold text-[#1f2a44]">In 12 minutes</span>
            </div>
            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-[#f06292] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-22px_rgba(216,8,128,0.55)] transition hover:translate-y-[-2px]"
            >
              Trigger manual sync
              <Zap className="h-4 w-4" />
            </button>
          </div>

          <div className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#fff4f8] text-[#d80880]">
                <ArrowRight className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#1f2a44]">Send alerts to your team</p>
                <p className="text-sm text-[#8a90a6]">Email or Slack notifications on failed imports and successful pushes.</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="rounded-full bg-[#f6f1fb] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a90a6]">
                    Slack incoming webhook
                  </span>
                  <span className="rounded-full bg-[#f0f5ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#3D64FF]">
                    Email digest
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
