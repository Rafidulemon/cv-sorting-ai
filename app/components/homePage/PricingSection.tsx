import React from "react";
import { ArrowRight, Check } from "lucide-react";

import { getPricingData } from "@/app/lib/getPricingData";
import type { PricingPlan } from "@/app/data/pricing";

const formatPrice = (amount: number) =>
  amount === 0 ? "BDT 0" : new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(amount);

export default async function PricingSection() {
  const { plans } = await getPricingData();

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-sm font-semibold tracking-widest text-zinc-500">
              PRICING
            </div>
            <h2 className="mt-3 text-3xl font-extrabold text-zinc-900 md:text-4xl">
              Simple plans to get started fast
            </h2>
            <p className="mt-3 max-w-xl text-sm text-zinc-600 sm:text-base">
              Compare a quick snapshot here and explore the full breakdown on the
              pricing page.
            </p>
          </div>
          <a
            href="/pricing#comparison"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-500 transition hover:text-primary-400"
          >
            See full comparison
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.slug}
              className={`rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
                plan.highlight
                  ? "border-primary-500/40 shadow-[0_20px_50px_rgba(216,8,128,0.18)]"
                  : "border-zinc-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xl font-semibold text-zinc-900">
                    {plan.name}
                  </div>
                  <p className="mt-2 text-sm text-zinc-600">{plan.description}</p>
                </div>
                {plan.highlight ? (
                  <span className="rounded-full bg-primary-500/10 px-3 py-1 text-xs font-semibold text-primary-500">
                    Popular
                  </span>
                ) : null}
              </div>

              <div className="mt-6 flex items-end gap-2 text-zinc-900">
                <div className="text-3xl font-extrabold tracking-tight">
                  {formatPrice(plan.price)}
                </div>
                <div className="pb-1 text-xs text-zinc-500">{plan.period}</div>
              </div>

              <button className="mt-5 w-full rounded-full bg-primary-500 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-400 shadow-glow-primary">
                {plan.cta}
              </button>

              <div className="mt-6 space-y-3 text-sm text-zinc-600">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary-500/15 text-primary-500">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
