import React from "react";
import { Check, Minus } from "lucide-react";
import { getPricingData } from "@/app/lib/getPricingData";

const formatPrice = (amount: number) =>
  amount === 0 ? "BDT 0" : new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(amount);

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 text-sm text-zinc-600">
      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary-500/15 text-primary-500">
        <Check className="h-3.5 w-3.5" />
      </span>
      <span>{text}</span>
    </div>
  );
}

function ComparisonCell({ value }: { value: string | number | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-500/10 text-primary-500">
        <Check className="h-4 w-4" />
      </span>
    ) : (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
        <Minus className="h-4 w-4" />
      </span>
    );
  }
  return <span className="text-sm font-semibold text-zinc-700">{String(value)}</span>;
}

export default async function PricingComparisonSection() {
  const { plans, creditUsage, freePlanNudge } = await getPricingData();

  const comparisonRows = [
    { label: "Monthly credits", values: plans.map((plan) => plan.monthlyCredits.toLocaleString()) },
    { label: "Approx CVs (1.5 credits/CV)", values: plans.map((plan) => plan.approxCvs) },
    { label: "Active jobs", values: plans.map((plan) => plan.activeJobs) },
    { label: "Ask AI about CV", values: plans.map((plan) => plan.askAi) },
    { label: "AI Job Description creation", values: plans.map((plan) => plan.aiJd) },
    { label: "OCR for scanned CVs", values: plans.map((plan) => plan.ocr) },
    { label: "Semantic search", values: plans.map((plan) => plan.semanticSearch) },
    { label: "Team members", values: plans.map((plan) => plan.team) },
    { label: "API access", values: plans.map((plan) => plan.apiAccess) },
    { label: "Support", values: plans.map((plan) => plan.support) },
    { label: "Credit top-up (per 100 credits)", values: plans.map((plan) => plan.topUp) },
  ];

  return (
    <section className="bg-white py-20" id="plans">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <div className="text-sm font-semibold tracking-widest text-zinc-500">
            PRICING
          </div>
          <h2 className="mt-3 text-3xl font-extrabold text-zinc-900 md:text-4xl">
            Choose the plan that fits your hiring volume
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-600 sm:text-base">
            Upgrade anytime. Every plan includes AI-driven CV sorting, candidate
            ranking, and sharable shortlists.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.slug}
              className={`rounded-3xl border bg-white p-8 shadow-sm transition ${
                plan.highlight
                  ? "border-primary-500/50 shadow-[0_20px_60px_rgba(216,8,128,0.2)]"
                  : "border-zinc-200"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-2xl font-semibold text-zinc-900">{plan.name}</div>
                  <p className="mt-2 text-sm text-zinc-600">{plan.description}</p>
                </div>
                {plan.highlight ? (
                  <span className="rounded-full bg-primary-500/10 px-3 py-1 text-xs font-semibold text-primary-500">
                    Most Popular
                  </span>
                ) : null}
              </div>

              <div className="mt-8 flex items-end gap-2 text-zinc-900">
                <div className="text-4xl font-extrabold tracking-tight">{formatPrice(plan.price)}</div>
                <div className="pb-1 text-sm text-zinc-500">{plan.period}</div>
              </div>

              <button className="mt-6 w-full rounded-full bg-primary-500 py-3 text-sm font-semibold text-white transition hover:bg-primary-400 shadow-glow-primary">
                {plan.cta}
              </button>

              <div className="mt-6 space-y-3">
                <div className="text-sm font-semibold text-zinc-900">
                  This includes:
                </div>
                {plan.features.map((feature) => (
                  <FeatureItem key={feature} text={feature} />
                ))}
                <div className="text-xs font-semibold text-primary-600">
                  BDT {plan.topUp} / 100 credits
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16" id="comparison">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="text-sm font-semibold text-zinc-500">COMPARISON</div>
              <h3 className="mt-2 text-2xl font-bold text-zinc-900">
                Compare plan features
              </h3>
            </div>
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-5 py-2 text-sm font-semibold text-zinc-700 transition hover:border-primary-500/50 hover:text-primary-500"
            >
              Talk to Sales
            </a>
          </div>

          <div className="mt-8 overflow-x-auto">
            <div className="min-w-[760px] rounded-3xl border border-zinc-200 bg-white">
              <div className="grid grid-cols-[1.2fr_repeat(3,1fr)] items-center gap-4 border-b border-zinc-200 px-6 py-4 text-sm font-semibold text-zinc-500">
                <span>Feature</span>
                {plans.map((plan) => (
                  <span key={plan.slug} className="text-center text-zinc-700">
                    {plan.name}
                  </span>
                ))}
              </div>
              {comparisonRows.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[1.2fr_repeat(3,1fr)] items-center gap-4 px-6 py-4 text-sm text-zinc-700 even:bg-zinc-50"
                >
                  <span className="font-medium text-zinc-800">{row.label}</span>
                  {row.values.map((value, index) => (
                    <div key={`${row.label}-${index}`} className="flex justify-center">
                      <ComparisonCell value={value} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <p className="mt-4 text-xs text-zinc-500">
            Need a custom plan or enterprise volume? Contact us for a tailored quote.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Credit usage reference
                </div>
                <h3 className="mt-2 text-2xl font-bold text-zinc-900">What each action costs</h3>
                <p className="mt-1 text-sm text-zinc-600">Credits represent AI usage — CV processing, Ask-AI, JD creation, OCR.</p>
              </div>
              <span className="rounded-full bg-primary-500/10 px-3 py-1 text-xs font-semibold text-primary-500">
                Billed in credits
              </span>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200">
              <div className="grid grid-cols-[1fr_0.5fr] bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-700">
                <span>Action</span>
                <span className="text-right">Credits</span>
              </div>
              {creditUsage.map(({ action, credits }) => (
                <div key={action} className="grid grid-cols-[1fr_0.5fr] items-center px-4 py-3 text-sm text-zinc-700 even:bg-zinc-50">
                  <span className="font-medium text-zinc-800">{action}</span>
                  <span className="text-right font-semibold">{credits}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-primary-100 bg-primary-50/60 p-6 shadow-sm">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-600">
              Why 10 free credits works
            </div>
            <h3 className="mt-2 text-2xl font-bold text-primary-900">
              {freePlanNudge.headline}
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-primary-900/80">
              {freePlanNudge.bullets.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-primary-500 shadow-sm">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 rounded-2xl bg-white/80 p-4 text-sm font-semibold text-primary-800 shadow-inner">
              {freePlanNudge.banner}
              <div className="text-xs font-medium text-primary-600">Surface this in-app to boost conversions.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
