import React from "react";
import { Check, Minus } from "lucide-react";

type Plan = {
  name: string;
  description: string;
  price: string;
  period: string;
  cta: string;
  highlight?: boolean;
  features: string[];
};

type ComparisonRow = {
  label: string;
  values: Array<string | boolean>;
};

const plans: Plan[] = [
  {
    name: "Starter",
    description:
      "Ideal for startups and small businesses beginning to leverage AI for recruitment.",
    price: "$9.99",
    period: "per month",
    cta: "Subscribe",
    features: [
      "Up to 3 open job positions",
      "Up to 50 CVs processed per job",
      "Two AI expert evaluations per CV",
      "Email support",
      "Basic analytics",
    ],
  },
  {
    name: "Standard",
    description: "Perfect for growing businesses that need more recruitment power.",
    price: "$29.99",
    period: "per month",
    cta: "Subscribe",
    highlight: true,
    features: [
      "Up to 5 open job positions",
      "Up to 100 CVs processed per job",
      "Three AI expert evaluations per CV",
      "High priority customer support",
      "3 team seats",
    ],
  },
  {
    name: "Professional",
    description:
      "Designed for established businesses looking for comprehensive recruitment solutions.",
    price: "$59.99",
    period: "per month",
    cta: "Subscribe",
    features: [
      "Up to 10 open job positions",
      "Up to 200 CVs processed per job",
      "Five AI expert evaluations per CV",
      "High priority customer support",
      "10 team seats",
    ],
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    label: "Open job positions",
    values: ["Up to 3", "Up to 5", "Up to 10"],
  },
  {
    label: "CVs processed per job",
    values: ["50", "100", "200"],
  },
  {
    label: "AI expert evaluations per CV",
    values: ["2", "3", "5"],
  },
  {
    label: "Team seats",
    values: ["1", "3", "10"],
  },
  {
    label: "Priority customer support",
    values: [false, true, true],
  },
  {
    label: "Advanced analytics",
    values: [false, true, true],
  },
  {
    label: "Workflow automations",
    values: [false, true, true],
  },
  {
    label: "Dedicated success manager",
    values: [false, false, true],
  },
];

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

function ComparisonCell({ value }: { value: string | boolean }) {
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
  return <span className="text-sm font-semibold text-zinc-700">{value}</span>;
}

export default function PricingComparisonSection() {
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
              key={plan.name}
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
                <div className="text-4xl font-extrabold tracking-tight">{plan.price}</div>
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
                  <span key={plan.name} className="text-center text-zinc-700">
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
      </div>
    </section>
  );
}
