"use client";

import React, { useMemo, useState } from "react";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import Button from "@/app/components/buttons/Button";
import Chip from "@/app/components/blog/Chip";
import FeaturedPost from "@/app/components/blog/FeaturedPost";
import PostCard from "@/app/components/blog/PostCard";
import { POSTS, CATEGORIES } from "@/app/constants/blogs";
import PageTitle from "@/app/components/typography/PageTitle";

export default function BlogPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");

  const featured = POSTS.find((p) => p.featured) ?? POSTS[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return POSTS.filter((p) => {
      const catOk = category === "All" ? true : p.category === category;
      const qOk =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q);
      return catOk && qOk;
    }).sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [query, category]);

  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(1000px_500px_at_10%_0%,rgba(216,8,128,0.12),transparent),radial-gradient(900px_500px_at_90%_0%,rgba(99,102,241,0.12),transparent)]" />
        <div className="relative mx-auto max-w-6xl px-6 pt-28 pb-14">
         <PageTitle title="carriX blog"/>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="space-y-5">
              <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 md:text-5xl">
                Hiring, AI, and workflow playbooks without the hype.
              </h1>
              <p className="max-w-2xl text-base text-zinc-600 md:text-lg">
                Product updates, transparent AI practices, and tactical guides for recruiters, hiring managers,
                and operators who want faster shortlists with clarity.
              </p>

              <div className="flex flex-wrap gap-3 text-sm font-semibold text-zinc-700">
                <span className="rounded-full bg-primary-50 px-4 py-2 text-primary-700 ring-1 ring-primary-100">
                  Explainable AI
                </span>
                <span className="rounded-full bg-amber-50 px-4 py-2 text-amber-700 ring-1 ring-amber-200">
                  Hiring Ops
                </span>
                <span className="rounded-full bg-violet-50 px-4 py-2 text-violet-700 ring-1 ring-violet-200">
                  Product updates
                </span>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button href="/auth/signup" variant="primary" size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Start for Free
                </Button>
                <Button href="/pricing" variant="secondary" size="md">
                  View pricing
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-card-soft">
              <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 shadow-sm">
                <Search className="h-4 w-4 text-zinc-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search articles (e.g. screening, criteria, API)…"
                  className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-500 outline-none"
                />
                {query ? (
                  <button
                    onClick={() => setQuery("")}
                    className="text-xs font-semibold text-zinc-500 hover:text-primary-600"
                    aria-label="Clear"
                  >
                    Clear
                  </button>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {CATEGORIES.map((c) => (
                  <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                    {c}
                  </Chip>
                ))}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  { label: "AI", text: "Responsible & explainable" },
                  { label: "Hiring", text: "Playbooks for faster cycles" },
                  { label: "Product", text: "Release notes & deep-dives" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-zinc-200 bg-white p-3 text-xs text-zinc-600"
                  >
                    <div className="text-sm font-semibold text-zinc-900">{item.label}</div>
                    <p className="mt-1">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <FeaturedPost post={featured} />
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-sm font-semibold tracking-[0.18em] text-primary-600">
              Latest
            </div>
            <h2 className="mt-2 text-3xl font-extrabold text-zinc-900">Fresh from the team</h2>
            <p className="text-sm text-zinc-600">Guides, releases, and interviews with hiring leaders.</p>
          </div>
          <div className="text-sm text-zinc-500">
            Showing <span className="font-semibold text-zinc-900">{filtered.length}</span> results
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </section>

    </main>
  );
}
