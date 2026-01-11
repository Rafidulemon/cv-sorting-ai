import React from "react";

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-xs font-semibold text-primary-700">
      {children}
    </span>
  );
}

function FeaturePill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white/85 ring-1 ring-white/15">
      {children}
    </span>
  );
}

function FeatureCard({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm hover:shadow-md transition">
      <div className="text-lg font-bold text-zinc-900">{title}</div>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600">{desc}</p>
    </div>
  );
}

function DarkFeatureCard({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-3xl border border-white/15 bg-white/5 p-8 shadow-[0_25px_70px_rgba(0,0,0,0.18)] hover:bg-white/10 transition">
      <div className="text-lg font-bold text-white">{title}</div>
      <p className="mt-3 text-sm leading-relaxed text-white/75">{desc}</p>
    </div>
  );
}

function Divider() {
  return <div className="h-px w-full bg-zinc-200" />;
}

function DarkDivider() {
  return <div className="h-px w-full bg-white/10" />;
}

export default function FeaturesPage() {
  return (
    <div className="bg-white">
      {/* HERO */}
      <section className="relative overflow-hidden bg-hero-base" id="features-hero">
        <div className="absolute inset-0 bg-[radial-gradient(1100px_600px_at_50%_15%,rgba(216,8,128,0.30),rgba(24,10,42,0.0)),linear-gradient(180deg,rgba(88,28,135,0.35),rgba(24,10,42,0.96))]" />

        {/* dotted pattern */}
        <div className="pointer-events-none absolute left-8 top-10 opacity-25">
          <div
            className="h-28 w-40"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)",
              backgroundSize: "10px 10px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 pt-28 pb-16">
          <div className="flex flex-col items-start gap-6">
            <FeaturePill>Features</FeaturePill>

            <h1 className="max-w-4xl text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Unlock the power of AI with
              <br />
              carriX features built for modern hiring
            </h1>

            <p className="max-w-2xl text-white/75 text-base md:text-lg leading-relaxed">
              From job setup to candidate shortlisting—carriX turns hours of resume screening
              into minutes with consistent criteria and explainable AI scoring.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-primary-500 px-7 py-3 text-sm font-semibold text-white
                           hover:bg-primary-400 transition shadow-[0_12px_30px_rgba(216,8,128,0.25)]"
              >
                Start for Free
              </a>
              <a
                href="/pricing"
                className="inline-flex items-center justify-center rounded-full border border-white/25 px-7 py-3 text-sm font-semibold text-white
                           hover:bg-white/10 transition"
              >
                View Pricing
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: EASY SETUP */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge>Easy Setup</Badge>
            <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-zinc-900">
              Create job criteria in moments
            </h2>
            <p className="mt-3 max-w-2xl text-zinc-600 leading-relaxed">
              carriX generates and prioritizes hiring criteria from your job description—then you can
              adjust it to match how your team hires.
            </p>
          </div>

          <a
            href="/signup"
            className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-6 py-3 text-sm font-semibold text-zinc-900
                       hover:bg-zinc-50 transition w-fit"
          >
            Create a Job →
          </a>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <FeatureCard
            title="Create a Job"
            desc="Paste a job description and instantly generate structured criteria your team can review and refine."
          />
          <FeatureCard
            title="Enhanced Insights"
            desc="Add what you’re looking for beyond the JD—carriX suggests strong signals and hidden-fit indicators."
          />
          <FeatureCard
            title="Feedback & Explainability"
            desc="Get clear reasoning for generated criteria and weighting, so decisions stay transparent and auditable."
          />
        </div>

        <div className="mt-12">
          <Divider />
        </div>
      </section>

      {/* SECTION: AUTOMATED SCORING (DARK) */}
      <section className="relative overflow-hidden bg-hero-base">
        <div className="absolute inset-0 bg-[radial-gradient(1100px_600px_at_45%_15%,rgba(216,8,128,0.22),rgba(24,10,42,0.96))]" />

        <div className="relative mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <FeaturePill>Automated Scoring</FeaturePill>
              <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-white">
                AI scoring you can trust
              </h2>
              <p className="mt-3 max-w-2xl text-white/75 leading-relaxed">
                Automatically evaluate resumes against your criteria with consistent scoring and clear rationale.
              </p>
            </div>

            <a
              href="/pricing"
              className="inline-flex items-center justify-center rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white
                         hover:bg-white/10 transition w-fit"
            >
              See Plans →
            </a>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <DarkFeatureCard
              title="Unbiased Screening"
              desc="Standardize evaluation based on role requirements and measurable signals—reduce inconsistent human screening."
            />
            <DarkFeatureCard
              title="Advanced Matching"
              desc="Go beyond keywords—identify relevance from skills, experience, impact, and role-fit context."
            />
            <DarkFeatureCard
              title="Detailed Reporting"
              desc="View scoring metrics, distributions, and ranked lists to guide faster, higher-quality hiring decisions."
            />
          </div>

          <div className="mt-12">
            <DarkDivider />
          </div>
        </div>
      </section>

      {/* SECTION: TRANSPARENT RESULTS */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge>Transparent Results</Badge>
            <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-zinc-900">
              Speed meets depth with explainable scoring
            </h2>
            <p className="mt-3 max-w-2xl text-zinc-600 leading-relaxed">
              carriX keeps your process observable—see how each candidate was scored and why.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <FeatureCard
            title="Automated Process"
            desc="Upload resumes in standard formats and get scored results in minutes—ready for shortlist review."
          />
          <FeatureCard
            title="Overview & Filters"
            desc="Compare candidates across criteria, apply filters, and organize shortlisted applicants in one place."
          />
          <FeatureCard
            title="Observability"
            desc="Every score includes rationale and evidence mapping—so you can explain decisions and improve criteria over time."
          />
        </div>
      </section>

      {/* TRANSFORMATION LIST */}
      <section className="bg-zinc-50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="text-center">
            <div className="text-sm font-semibold tracking-widest text-primary-700">
              OUTCOMES
            </div>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-zinc-900">
              How carriX transforms your recruiting process
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-zinc-600">
              Practical improvements you’ll feel from day one.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {[
              {
                title: "Accelerate hiring with AI shortlisting",
                desc: "Score large applicant pools quickly and focus interviews on the best-fit candidates.",
              },
              {
                title: "Improve matching with criteria analysis",
                desc: "Automatically identify key criteria and build a consistent rubric for each role.",
              },
              {
                title: "Discover hidden top talent",
                desc: "Surface strong candidates who meet or exceed expectations—even beyond explicit job requirements.",
              },
              {
                title: "Reduce bias with objective scoring",
                desc: "Evaluate resumes using role-aligned signals to minimize inconsistent screening and improve fairness.",
              },
              {
                title: "Get in-depth candidate evaluations",
                desc: "See explainable reasons behind each score to support confident decisions.",
              },
              {
                title: "Keep your process organized",
                desc: "View all candidate information, scores, and rankings in one place—sort, filter, and export.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm"
              >
                <div className="text-lg font-bold text-zinc-900">{item.title}</div>
                <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-14 flex justify-center gap-3">
            <a
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-primary-500 px-7 py-3 text-sm font-semibold text-white
                         hover:bg-primary-400 transition shadow-[0_12px_30px_rgba(216,8,128,0.25)]"
            >
              Start Free
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-7 py-3 text-sm font-semibold text-zinc-900
                         hover:bg-white transition"
            >
              Talk to Sales
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
