"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  Layers,
  Loader2,
  Save,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { CreditUsageRow, FreePlanNudge, PricingPlan } from "@/app/data/pricing";

type EditablePlan = PricingPlan & { sortOrder?: number };

type AdminPricingState = {
  plans: EditablePlan[];
  creditUsage: CreditUsageRow[];
  freePlanNudge: FreePlanNudge;
};

export default function PlansPage() {
  const [data, setData] = useState<AdminPricingState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPricing = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/pricing", { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load pricing (${res.status})`);
      const body = await res.json();
      setData({
        plans: (body.plans ?? []) as EditablePlan[],
        creditUsage: (body.creditUsage ?? []) as CreditUsageRow[],
        freePlanNudge: (body.freePlanNudge ??
          {
            headline: "",
            bullets: [],
            banner: "",
          }) as FreePlanNudge,
      });
    } catch (err: any) {
      setError(err?.message || "Failed to load pricing.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPricing();
  }, [loadPricing]);

  const plans = useMemo(
    () => [...(data?.plans ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [data?.plans],
  );

  const updatePlan = (slug: string, updater: (plan: EditablePlan) => EditablePlan) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        plans: prev.plans.map((plan) => (plan.slug === slug ? updater(plan) : plan)),
      };
    });
  };

  const updateCreditUsage = (index: number, field: keyof CreditUsageRow, value: string) => {
    setData((prev) => {
      if (!prev) return prev;
      const creditUsage = [...prev.creditUsage];
      creditUsage[index] = { ...creditUsage[index], [field]: value };
      return { ...prev, creditUsage };
    });
  };

  const updateNudge = (field: keyof FreePlanNudge, value: string | string[]) => {
    setData((prev) => {
      if (!prev) return prev;
      return { ...prev, freePlanNudge: { ...prev.freePlanNudge, [field]: value } };
    });
  };

  const handleSave = async () => {
    if (!data) {
      setError("Nothing to save. Reload the page.");
      return;
    }

    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const payload = {
        plans: plans.map((plan, index) => ({
          ...plan,
          sortOrder: index,
        })),
        creditUsage: data.creditUsage,
        freePlanNudge: data.freePlanNudge,
      };

      const res = await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Save failed (${res.status})`);
      }
      setMessage("Pricing saved");
    } catch (err: any) {
      setError(err?.message || "Failed to save pricing");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-sm text-slate-300">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading pricing…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-200">
        <div className="flex items-center gap-2 text-rose-200">
          <Loader2 className="h-4 w-4" />
          Unable to load pricing data.
        </div>
        {error ? <div className="text-rose-200">{error}</div> : null}
        <button
          onClick={loadPricing}
          className="inline-flex items-center gap-2 rounded-lg border border-primary-500/50 bg-primary-500/10 px-3 py-2 text-primary-100 transition hover:bg-primary-500/15"
          type="button"
        >
          Reload data
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Billing</p>
          <h1 className="text-2xl font-semibold text-white">Plans & entitlements</h1>
          <p className="text-sm text-slate-400">
            Manage plan definitions, allowances, seats, per-credit pricing, and the free-plan nudge copy.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg border border-primary-500/50 bg-primary-500/10 px-3 py-2 text-primary-100 transition hover:bg-primary-500/15 disabled:opacity-60"
            type="button"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save pricing
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 transition hover:bg-slate-800/80"
            type="button"
            onClick={loadPricing}
          >
            <Layers className="h-4 w-4" />
            Reload from server
          </button>
        </div>
      </header>

      {message ? <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-emerald-100">{message}</div> : null}
      {error ? <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-rose-100">{error}</div> : null}

      <section className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.slug}
            className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">{plan.name}</p>
                <input
                  type="number"
                  className="mt-1 w-full rounded-md border border-slate-800 bg-slate-800/60 px-2 py-1 text-lg font-semibold text-white"
                  value={plan.price}
                  onChange={(e) => updatePlan(plan.slug, (p) => ({ ...p, price: Number(e.target.value) || 0 }))}
                />
                <input
                  className="mt-1 w-full rounded-md border border-slate-800 bg-slate-800/60 px-2 py-1 text-sm text-slate-200"
                  value={plan.period}
                  onChange={(e) => updatePlan(plan.slug, (p) => ({ ...p, period: e.target.value }))}
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-200">
                <input
                  type="checkbox"
                  checked={Boolean(plan.highlight)}
                  onChange={(e) => updatePlan(plan.slug, (p) => ({ ...p, highlight: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-700 text-primary-400"
                />
                <span>Most Popular</span>
              </label>
            </div>

            <textarea
              className="w-full rounded-md border border-slate-800 bg-slate-800/60 px-2 py-1 text-sm text-slate-200"
              value={plan.description}
              onChange={(e) => updatePlan(plan.slug, (p) => ({ ...p, description: e.target.value }))}
            />

            <div className="grid grid-cols-2 gap-2 text-sm text-slate-200">
              <label className="space-y-1">
                <span className="text-xs text-slate-400">CTA</span>
                <input
                  className="w-full rounded-md border border-slate-800 bg-slate-800/60 px-2 py-1"
                  value={plan.cta}
                  onChange={(e) => updatePlan(plan.slug, (p) => ({ ...p, cta: e.target.value }))}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-slate-400">Top-up</span>
                <input
                  type="number"
                  className="w-full rounded-md border border-slate-800 bg-slate-800/60 px-2 py-1"
                  value={plan.topUp}
                  onChange={(e) => updatePlan(plan.slug, (p) => ({ ...p, topUp: Number(e.target.value) || 0 }))}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-slate-400">Monthly credits</span>
                <input
                  type="number"
                  className="w-full rounded-md border border-slate-800 bg-slate-800/60 px-2 py-1"
                  value={plan.monthlyCredits}
                  onChange={(e) => updatePlan(plan.slug, (p) => ({ ...p, monthlyCredits: Number(e.target.value) || 0 }))}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-slate-400">Approx CVs</span>
                <input
                  className="w-full rounded-md border border-slate-800 bg-slate-800/60 px-2 py-1"
                  value={plan.approxCvs}
                  onChange={(e) => updatePlan(plan.slug, (p) => ({ ...p, approxCvs: e.target.value }))}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-slate-400">Active jobs</span>
                <input
                  className="w-full rounded-md border border-slate-800 bg-slate-800/60 px-2 py-1"
                  value={plan.activeJobs}
                  onChange={(e) => updatePlan(plan.slug, (p) => ({ ...p, activeJobs: e.target.value }))}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-slate-400">Team</span>
                <input
                  className="w-full rounded-md border border-slate-800 bg-slate-800/60 px-2 py-1"
                  value={plan.team}
                  onChange={(e) => updatePlan(plan.slug, (p) => ({ ...p, team: e.target.value }))}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-slate-400">Support</span>
                <input
                  className="w-full rounded-md border border-slate-800 bg-slate-800/60 px-2 py-1"
                  value={plan.support}
                  onChange={(e) => updatePlan(plan.slug, (p) => ({ ...p, support: e.target.value }))}
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-slate-400">OCR</span>
                <input
                  className="w-full rounded-md border border-slate-800 bg-slate-800/60 px-2 py-1"
                  value={plan.ocr}
                  onChange={(e) => updatePlan(plan.slug, (p) => ({ ...p, ocr: e.target.value }))}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-200">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={plan.askAi}
                  onChange={(e) => updatePlan(plan.slug, (p) => ({ ...p, askAi: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-700 text-primary-400"
                />
                Ask AI about CV
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={plan.aiJd}
                  onChange={(e) => updatePlan(plan.slug, (p) => ({ ...p, aiJd: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-700 text-primary-400"
                />
                AI JD creation
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={plan.semanticSearch}
                  onChange={(e) => updatePlan(plan.slug, (p) => ({ ...p, semanticSearch: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-700 text-primary-400"
                />
                Semantic search
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={plan.apiAccess}
                  onChange={(e) => updatePlan(plan.slug, (p) => ({ ...p, apiAccess: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-700 text-primary-400"
                />
                API access
              </label>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-200">Features (one per line)</div>
              <textarea
                className="w-full rounded-md border border-slate-800 bg-slate-800/60 px-2 py-2 text-sm text-slate-200"
                rows={5}
                value={plan.features.join("\n")}
                onChange={(e) =>
                  updatePlan(plan.slug, (p) => ({
                    ...p,
                    features: e.target.value
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean),
                  }))
                }
              />
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Entitlements</p>
            <h2 className="text-lg font-semibold text-white">Credit usage reference</h2>
            <p className="text-sm text-slate-400">Define how many credits each action consumes.</p>
          </div>
          <BadgeCheck className="h-5 w-5 text-primary-200" />
        </div>
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/80 text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Action</th>
                <th className="px-4 py-3 text-left font-semibold">Credits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {data.creditUsage.map((row, index) => (
                <tr key={row.action} className="hover:bg-slate-900/60">
                  <td className="px-4 py-3">
                    <input
                      className="w-full rounded-md border border-slate-800 bg-slate-800/60 px-2 py-1 text-slate-200"
                      value={row.action}
                      onChange={(e) => updateCreditUsage(index, "action", e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      className="w-full rounded-md border border-slate-800 bg-slate-800/60 px-2 py-1 text-slate-200"
                      value={row.credits}
                      onChange={(e) => updateCreditUsage(index, "credits", e.target.value)}
                    />
                  </td>
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
              <h2 className="text-lg font-semibold text-white">Free plan nudge</h2>
              <p className="text-sm text-slate-400">Copy shown to Free users to encourage upgrade.</p>
            </div>
            <Sparkles className="h-5 w-5 text-primary-200" />
          </div>
          <label className="space-y-1 text-sm text-slate-200">
            <span className="text-xs text-slate-400">Headline</span>
            <input
              className="w-full rounded-md border border-slate-800 bg-slate-800/60 px-2 py-1"
              value={data.freePlanNudge.headline}
              onChange={(e) => updateNudge("headline", e.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm text-slate-200">
            <span className="text-xs text-slate-400">Bullets (one per line)</span>
            <textarea
              className="w-full rounded-md border border-slate-800 bg-slate-800/60 px-2 py-2"
              rows={4}
              value={data.freePlanNudge.bullets.join("\n")}
              onChange={(e) =>
                updateNudge(
                  "bullets",
                  e.target.value
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean),
                )
              }
            />
          </label>
          <label className="space-y-1 text-sm text-slate-200">
            <span className="text-xs text-slate-400">Banner text</span>
            <input
              className="w-full rounded-md border border-slate-800 bg-slate-800/60 px-2 py-1"
              value={data.freePlanNudge.banner}
              onChange={(e) => updateNudge("banner", e.target.value)}
            />
          </label>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Growth</p>
              <h2 className="text-lg font-semibold text-white">ARPA & expansion</h2>
            </div>
            <TrendingUp className="h-5 w-5 text-primary-200" />
          </div>
          <p className="text-sm text-slate-300">Wire charts here once analytics are available.</p>
          <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-3 text-xs text-slate-400">
            Add graphs for plan adoption and expansion MRR.
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-[0_25px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-200">Status</p>
              <h2 className="text-lg font-semibold text-white">Plan highlights</h2>
            </div>
            <CheckCircle2 className="h-5 w-5 text-primary-200" />
          </div>
          <ul className="space-y-2 text-sm text-slate-200">
            {plans.map((plan) => (
              <li key={plan.slug} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary-400" aria-hidden />
                <span>
                  {plan.name}: {plan.monthlyCredits.toLocaleString()} credits, {plan.activeJobs}, {plan.team}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
