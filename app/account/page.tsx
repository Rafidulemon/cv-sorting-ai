import { Bell, CreditCard, ShieldCheck, Sparkles, UploadCloud, Users2 } from 'lucide-react';
import Layout from '../components/Layout';

const usageHighlights = [
  { label: 'Active seats', value: '6', helper: '+2 this month', icon: Users2 },
  { label: 'Monthly CV allowance', value: '312 / 500', helper: 'Renewal on 28 Nov', icon: UploadCloud },
  { label: 'Plan status', value: 'Scale', helper: 'Includes advanced scoring', icon: ShieldCheck },
];

const notificationPreferences = [
  {
    title: 'Weekly talent digest',
    description: 'Curated report of shortlisted candidates and pipeline health.',
    enabled: true,
  },
  {
    title: 'Processing alerts',
    description: 'Instant notifications when a job finishes sorting or encounters an issue.',
    enabled: true,
  },
  {
    title: 'Insights & experiments',
    description: 'Early access announcements and optimisation suggestions from the AI.',
    enabled: false,
  },
];

const planFeatures = [
  'Unlimited job descriptions with AI assisted drafting.',
  'Advanced semantic scoring and bias mitigation controls.',
  'Priority support with a dedicated talent advisor.',
];

export default function AccountPage() {
  return (
    <Layout>
      <div className="space-y-10 text-slate-100">
        <section className="relative overflow-hidden rounded-4xl border border-white/10 bg-gradient-to-br from-primary-700 via-primary-500 to-accent-500 p-10 shadow-glow-primary">
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <div className="absolute -top-20 right-12 h-60 w-60 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute -bottom-24 left-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          </div>
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white/80">
                <Sparkles className="h-4 w-4" />
                Account centre
              </span>
              <h1 className="text-3xl font-semibold leading-tight text-white lg:text-4xl">
                Keep your hiring workspace aligned
              </h1>
              <p className="max-w-xl text-sm text-white/85 lg:text-base">
                Manage billing, seats, and notifications for the whole talent team. Everything stays in sync with your
                AI-powered workflows.
              </p>
            </div>
            <div className="rounded-3xl border border-white/20 bg-white/15 p-6 text-white shadow-glow-primary backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80">Current balance</p>
              <p className="mt-3 text-3xl font-semibold">£1,284.00</p>
              <p className="mt-1 text-xs text-white/70">Next invoice scheduled · 28 November 2025</p>
              <button className="mt-6 inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-white/40 hover:bg-white/20">
                <CreditCard className="mr-2 h-4 w-4" />
                Manage billing
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {usageHighlights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-card-soft backdrop-blur"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
                <div className="relative space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-200/80">{item.label}</p>
                    <p className="mt-3 text-2xl font-semibold text-white">{item.value}</p>
                    <p className="mt-1 text-sm text-slate-300/80">{item.helper}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-slate-900/60 p-8 shadow-card-soft backdrop-blur">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-10 right-0 h-36 w-36 rounded-full bg-primary-500/20 blur-3xl" />
            </div>
            <div className="relative space-y-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-primary-200" />
                <h2 className="text-lg font-semibold text-white">Plan benefits</h2>
              </div>
              <p className="text-sm text-slate-300/80">
                You&apos;re on the Scale plan. Unlock additional automation, role duplication, and SSO support by
                upgrading to Enterprise.
              </p>
              <ul className="space-y-3 text-sm text-slate-200/80">
                {planFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 h-4 w-4 text-primary-200" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-white/30 hover:bg-white/10">
                Explore Enterprise
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-slate-900/60 p-8 shadow-card-soft backdrop-blur">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute bottom-[-4rem] left-10 h-40 w-40 rounded-full bg-accent-500/20 blur-3xl" />
            </div>
            <div className="relative space-y-6">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-primary-200" />
                <h2 className="text-lg font-semibold text-white">Notifications</h2>
              </div>
              <div className="space-y-4">
                {notificationPreferences.map((item) => (
                  <div
                    key={item.title}
                    className="flex items-start justify-between gap-6 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200/80"
                  >
                    <div>
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-300/80">{item.description}</p>
                    </div>
                    <span
                      className={`inline-flex min-w-[4.5rem] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                        item.enabled ? 'bg-primary-500/30 text-primary-100' : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {item.enabled ? 'Enabled' : 'Muted'}
                    </span>
                  </div>
                ))}
              </div>
              <button className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:border-white/30 hover:bg-white/10">
                Adjust preferences
              </button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
