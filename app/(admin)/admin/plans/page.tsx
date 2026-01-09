import { BadgeCheck, CheckCircle2, DollarSign, Layers, Sparkles, TrendingUp } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    cadence: "month",
    resumes: "10 resumes/mo",
    seats: "1 seat (owner)",
    credits: "$2/resume top-up",
    features: ["Basic reasoning", "Email outreach", "PII-safe exports"],
    status: "Live",
  },
  {
    name: "Standard",
    price: "$119",
    cadence: "mo (annual) or $149/mo",
    resumes: "100 resumes/mo",
    seats: "1 seat",
    credits: "$1.50/resume top-up",
    features: ["Advanced reasoning", "API access", "Integrations (coming)", "Advanced analytics (coming)"],
    status: "Live",
  },
  {
    name: "Premium",
    price: "$239",
    cadence: "mo (annual) or $299/mo",
    resumes: "500 resumes/mo",
    seats: "5 seats",
    credits: "$1.25/resume top-up",
    features: ["Advanced reasoning", "API access", "Integrations (coming)", "Advanced analytics (coming)"],
    status: "Live",
  },
];

const entitlements = [
  { feature: "Resume allowance", free: "10/mo", standard: "100/mo", premium: "500/mo" },
  { feature: "Seats", free: "1", standard: "1", premium: "5" },
  { feature: "API access", free: "No", standard: "Yes", premium: "Yes" },
  { feature: "Advanced reasoning", free: "No", standard: "Yes", premium: "Yes" },
  { feature: "Integrations", free: "Soon", standard: "Soon", premium: "Soon" },
  { feature: "Analytics", free: "Soon", standard: "Soon", premium: "Soon" },
];

export default function PlansPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Billing</p>
          <h1 className="text-2xl font-semibold text-white">Plans & entitlements</h1>
          <p className="text-sm text-slate-400">Manage plan definitions, allowances, seats, and per-resume credit pricing.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <button className="inline-flex items-center gap-2 rounded-lg border border-primary-500/50 bg-primary-500/10 px-3 py-2 text-primary-100 transition hover:bg-primary-500/15" type="button">
            <Sparkles className="h-4 w-4" />
            Add new plan
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 transition hover:bg-slate-800/80" type="button">
            <Layers className="h-4 w-4" />
            Edit entitlements
          </button>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.name} className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">{plan.name}</p>
                <h3 className="text-2xl font-semibold text-white">{plan.price}</h3>
                <p className="text-sm text-slate-400">per {plan.cadence}</p>
              </div>
              <span className="rounded-full bg-success-500/15 px-3 py-1 text-xs font-semibold text-success-100">{plan.status}</span>
            </div>
            <div className="space-y-1 text-sm text-slate-300">
              <p>{plan.resumes}</p>
              <p>{plan.seats}</p>
              <p>Credits: {plan.credits}</p>
            </div>
            <ul className="space-y-2 text-sm text-slate-200">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary-200" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Entitlements</p>
            <h2 className="text-lg font-semibold text-white">Feature matrix</h2>
            <p className="text-sm text-slate-400">Map features to plans and ensure limits are enforced.</p>
          </div>
          <BadgeCheck className="h-5 w-5 text-primary-200" />
        </div>
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/80 text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Feature</th>
                <th className="px-4 py-3 text-left font-semibold">Free</th>
                <th className="px-4 py-3 text-left font-semibold">Standard</th>
                <th className="px-4 py-3 text-left font-semibold">Premium</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {entitlements.map((row) => (
                <tr key={row.feature} className="hover:bg-slate-900/60">
                  <td className="px-4 py-3 font-semibold text-white">{row.feature}</td>
                  <td className="px-4 py-3 text-slate-300">{row.free}</td>
                  <td className="px-4 py-3 text-slate-300">{row.standard}</td>
                  <td className="px-4 py-3 text-slate-300">{row.premium}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Pricing</p>
              <h2 className="text-lg font-semibold text-white">Per-resume credits</h2>
            </div>
            <DollarSign className="h-5 w-5 text-primary-200" />
          </div>
          <ul className="space-y-2 text-sm text-slate-200">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-primary-400" aria-hidden />
              Free: $2/resume top-up
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-primary-400" aria-hidden />
              Standard: $1.50/resume top-up
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-primary-400" aria-hidden />
              Premium: $1.25/resume top-up
            </li>
          </ul>
          <p className="text-xs text-slate-400">Use plan limits first, then bill credits per resume.</p>
        </div>
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Growth</p>
              <h2 className="text-lg font-semibold text-white">ARPA & expansion</h2>
            </div>
            <TrendingUp className="h-5 w-5 text-primary-200" />
          </div>
          <p className="text-sm text-slate-300">Use this area to track plan mix, expansion, and churn once data is wired.</p>
          <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3 text-xs text-slate-400">Add graphs for plan adoption and expansion MRR.</div>
        </div>
      </section>
    </div>
  );
}
