"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Mail,
  MessageSquare,
  Minus,
  Plus,
  Search,
} from "lucide-react";
import Button from "@/app/components/buttons/Button";

type FAQ = {
  id: string;
  category: "Getting Started" | "Pricing" | "Security" | "Product" | "Integrations";
  question: string;
  answer: string;
};

const FAQS: FAQ[] = [
  {
    id: "gs-1",
    category: "Getting Started",
    question: "What is carriX?",
    answer:
      "carriX is an AI-powered resume screening and hiring platform that helps you evaluate candidates faster by scoring, ranking, and shortlisting resumes against your job criteria.",
  },
  {
    id: "gs-2",
    category: "Getting Started",
    question: "How do I start screening resumes?",
    answer:
      "Create a job by pasting a job description, upload candidate CVs, and let carriX generate criteria and scores. You can edit criteria anytime to match your hiring needs.",
  },
  {
    id: "prod-1",
    category: "Product",
    question: "Can I customize the screening criteria?",
    answer:
      "Yes. carriX can suggest criteria automatically, and you can add, remove, reweight, or rewrite requirements to reflect your exact role needs.",
  },
  {
    id: "prod-2",
    category: "Product",
    question: "Does carriX explain why a candidate scored higher?",
    answer:
      "Yes. carriX provides transparent, explainable scoring with key signals and rationale so you can trust decisions and audit outcomes.",
  },
  {
    id: "price-1",
    category: "Pricing",
    question: "Do you offer annual billing discounts?",
    answer:
      "Yes. Annual plans are discounted (up to 20%). You can also choose month-to-month billing on paid tiers.",
  },
  {
    id: "price-2",
    category: "Pricing",
    question: "What counts as a resume credit?",
    answer:
      "Each candidate resume/CV analyzed by carriX counts as one resume credit.",
  },
  {
    id: "price-3",
    category: "Pricing",
    question: "Can I add more resume credits?",
    answer:
      "Yes. You can purchase additional credits anytime. Higher tiers also include lower per-resume pricing.",
  },
  {
    id: "sec-1",
    category: "Security",
    question: "Is my data secure?",
    answer:
      "We use modern security best practices including encryption in transit and at rest, strict access controls, and least-privilege policies. If you need custom requirements, contact us.",
  },
  {
    id: "sec-2",
    category: "Security",
    question: "Do you store uploaded resumes?",
    answer:
      "You control your data. By default, resumes are stored only as needed to provide the service and improve your workflow. For stricter retention policies, we can support custom settings.",
  },
  {
    id: "int-1",
    category: "Integrations",
    question: "Do you integrate with ATS tools?",
    answer:
      "Integrations are on the roadmap. If you need a specific ATS integration, contact sales. We prioritize based on demand.",
  },
  {
    id: "int-2",
    category: "Integrations",
    question: "Do you have an API?",
    answer:
      "Yes. API access is available on paid plans so you can automate screening and connect carriX to your internal tools.",
  },
];

const CATEGORIES: FAQ["category"][] = [
  "Getting Started",
  "Product",
  "Pricing",
  "Security",
  "Integrations",
];

function HeroBg() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -top-32 right-0 h-80 w-80 rounded-full bg-primary-500/15 blur-3xl" />
      <div className="absolute left-[-120px] top-24 h-72 w-72 rounded-full bg-rose-200/50 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(800px_240px_at_50%_0%,rgba(216,8,128,0.08),transparent)]" />
    </div>
  );
}

function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ring-1 ${
        active
          ? "bg-primary-500 text-white ring-primary-500/60 shadow-glow-primary"
          : "bg-white text-zinc-600 ring-zinc-200 hover:text-primary-500 hover:ring-primary-200"
      }`}
    >
      {children}
    </button>
  );
}

function AccordionItem({
  q,
  a,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`rounded-2xl border bg-white shadow-sm transition ${
        open ? "border-primary-200" : "border-zinc-200"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
      >
        <div className="text-base font-semibold text-zinc-900">{q}</div>
        <div
          className={`grid h-9 w-9 place-items-center rounded-full border transition ${
            open
              ? "border-primary-200 bg-primary-50"
              : "border-zinc-200 bg-white"
          }`}
        >
          {open ? (
            <Minus className="h-4 w-4 text-primary-500" />
          ) : (
            <Plus className="h-4 w-4 text-zinc-500" />
          )}
        </div>
      </button>
      {open && (
        <div className="px-6 pb-6 text-sm leading-relaxed text-zinc-600">
          {a}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FAQ["category"] | "All">("All");
  const [openId, setOpenId] = useState<string | null>("gs-1");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter((f) => {
      const catOk = category === "All" ? true : f.category === category;
      const qOk =
        !q ||
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [query, category]);

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-white" id="top">
        <HeroBg />

        <div className="relative mx-auto max-w-6xl px-6 pt-24 pb-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary-600 ring-1 ring-primary-200">
              <MessageSquare className="h-4 w-4" />
              Help Center
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-zinc-900 md:text-5xl">
              Frequently Asked Questions
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-600 sm:text-base">
              Quick answers about carriX, pricing, security, and integrations.
            </p>

            <div className="mt-8">
              <div className="mx-auto flex max-w-2xl items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
                <Search className="h-4 w-4 text-zinc-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search questions (billing, API, security)"
                  className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 outline-none"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="text-xs font-semibold text-zinc-500 hover:text-primary-500"
                    aria-label="Clear"
                  >
                    Clear
                  </button>
                ) : null}
              </div>

              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Chip active={category === "All"} onClick={() => setCategory("All")}
                >
                  All
                </Chip>
                {CATEGORIES.map((c) => (
                  <Chip
                    key={c}
                    active={category === c}
                    onClick={() => setCategory(c)}
                  >
                    {c}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-zinc-50/70 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {filtered.length === 0 ? (
                <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-zinc-700">
                  <div className="text-lg font-semibold text-zinc-900">
                    No results found
                  </div>
                  <div className="mt-2 text-sm text-zinc-600">
                    Try a different keyword or select another category.
                  </div>
                </div>
              ) : (
                filtered.map((f) => (
                  <AccordionItem
                    key={f.id}
                    q={f.question}
                    a={f.answer}
                    open={openId === f.id}
                    onToggle={() => setOpenId(openId === f.id ? null : f.id)}
                  />
                ))
              )}
            </div>

            <aside className="h-fit space-y-6">
              <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
                <div className="text-sm font-semibold text-zinc-500">Need help?</div>
                <div className="mt-2 text-2xl font-extrabold text-zinc-900">
                  Talk to our team
                </div>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                  If you did not find what you need, contact us for product help,
                  billing questions, or enterprise requirements.
                </p>

                <div className="mt-6 space-y-3">
                  <Button href="/contact" fullWidth>
                    Contact Us
                  </Button>
                  <Button
                    href="mailto:hello@carrix.ai"
                    variant="secondary"
                    fullWidth
                    leftIcon={<Mail className="h-4 w-4" />}
                    className="text-zinc-800"
                  >
                    Email hello@carrix.ai
                  </Button>
                </div>
              </div>

              <div className="rounded-3xl border border-primary-100 bg-primary-50/60 p-6">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary-500">
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-zinc-900">
                      Pro tip
                    </div>
                    <p className="mt-1 text-sm text-zinc-600">
                      Search for keywords like "API", "credits", or "security"
                      to jump to the right section fast.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="text-sm font-semibold text-zinc-500">Resources</div>
                <div className="mt-2 space-y-3 text-sm text-zinc-700">
                  <a
                    href="/pricing#comparison"
                    className="flex items-center justify-between rounded-2xl border border-zinc-200 px-4 py-3 transition hover:border-primary-200 hover:text-primary-500"
                  >
                    Compare plans
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                  <a
                    href="/contact"
                    className="flex items-center justify-between rounded-2xl border border-zinc-200 px-4 py-3 transition hover:border-primary-200 hover:text-primary-500"
                  >
                    Book a demo
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
