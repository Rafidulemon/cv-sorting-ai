import Button from "@/app/components/buttons/Button";
import PageTitle from "@/app/components/typography/PageTitle";
import { metrics, pillars, timeline } from "@/app/constants/about";
import {
  ArrowRight,
  Clock3,
  Globe2,
  Rocket,
  Users,
} from "lucide-react";


export default function AboutPage() {
  return (
    <main className="bg-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(1000px_500px_at_10%_0%,rgba(216,8,128,0.12),transparent),radial-gradient(900px_500px_at_90%_0%,rgba(99,102,241,0.12),transparent)]" />

        <div className="relative mx-auto max-w-6xl px-6 pt-28 pb-20">
          <PageTitle title="About carriX"/>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="space-y-6 text-white">
              <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 md:text-5xl">
                We’re building the hiring layer for the AI-first workplace.
              </h1>
              <p className="max-w-2xl text-base text-zinc-600 md:text-lg">
                carriX turns resume chaos into confident, explainable shortlists. We blend
                AI scoring with transparent reasoning so recruiters, hiring managers, and leaders
                move from intake to offer with clarity.
              </p>

              <div className="flex flex-wrap gap-3 text-sm font-semibold text-zinc-700">
                <span className="rounded-full bg-primary-50 px-4 py-2 text-primary-700 ring-1 ring-primary-100">
                  Job-aware scoring
                </span>
                <span className="rounded-full bg-primary-50 px-4 py-2 text-primary-700 ring-1 ring-primary-100">
                  Collaboration-ready
                </span>
                <span className="rounded-full bg-primary-50 px-4 py-2 text-primary-700 ring-1 ring-primary-100">
                  Explainable by design
                </span>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button href="/auth/signup" variant="primary" size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Start for Free
                </Button>
                <Button href="/contact" variant="white" size="md" className="text-white border-white/50 hover:border-white/70">
                  Talk to us
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/5 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur">
              <div className="grid gap-4 sm:grid-cols-2">
                {metrics.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-2xl border border-white/15 bg-white/10 p-4"
                  >
                    <div className="text-2xl font-extrabold">{m.value}</div>
                    <div className="mt-1 text-xs uppercase tracking-wide">
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/10 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <Rocket className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Built for hiring velocity</div>
                  <p className="text-xs">
                    Intake, score, shortlist, and export—without losing human oversight.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-sm font-semibold tracking-[0.2em] text-primary-600">
              PRINCIPLES
            </div>
            <h2 className="mt-2 text-3xl font-extrabold text-zinc-900 md:text-4xl">
              Designed for trust, speed, and collaboration.
            </h2>
          </div>
          <p className="max-w-xl text-sm text-zinc-600 md:text-base">
            We ship fast, but never at the expense of fairness or clarity. carriX keeps
            recruiters in control with explainable decisions and configurable workflows.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {pillars.map(({ title, desc, icon: Icon }) => (
            <div
              key={title}
              className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-card-soft"
            >
              <div className="absolute inset-0 bg-[radial-gradient(360px_200px_at_90%_0%,rgba(216,8,128,0.06),transparent)]" />
              <div className="relative flex items-start gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-lg font-semibold text-zinc-900">{title}</div>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Story timeline */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="rounded-3xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-50 p-8 shadow-card-soft md:p-10">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm font-semibold tracking-[0.18em] text-primary-600">
                OUR STORY
              </div>
              <h3 className="mt-2 text-3xl font-extrabold text-zinc-900 md:text-4xl">
                From screening chaos to confident shortlists.
              </h3>
            </div>
            <Button href="/contact" variant="secondary" size="sm">
              Book a walkthrough
            </Button>
          </div>

          <div className="mt-10 space-y-6 border-l border-dashed border-primary-100 pl-4 md:pl-8">
            {timeline.map((item) => (
              <div key={item.title} className="relative pl-8">
                <div className="absolute left-[-28px] top-1.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 ring-1 ring-primary-100">
                  {item.year}
                </div>
                <div className="text-lg font-semibold text-zinc-900">{item.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Operating model */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl bg-[#0f1a35] p-10 text-white shadow-[0_25px_70px_rgba(0,0,0,0.2)]">
            <div className="text-sm font-semibold text-white/70">How we work</div>
            <h3 className="mt-3 text-3xl font-extrabold leading-tight">
              Built with recruiting teams, not just for them.
            </h3>
            <p className="mt-3 text-sm text-white/75">
              We co-design workflows with talent teams, iterate quickly, and ship safety
              features first: auditability, permissions, and transparent decisions.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                { label: "Global-ready", icon: Globe2, desc: "Designed for distributed hiring teams." },
                { label: "Fast onboarding", icon: Rocket, desc: "Spin up a workspace in minutes with guided setup." },
                { label: "Collaboration", icon: Users, desc: "Comments, reviews, and exports for stakeholders." },
                { label: "Speed & safety", icon: Clock3, desc: "Rapid shortlists with explainability baked in." },
              ].map(({ label, icon: Icon, desc }) => (
                <div key={label} className="flex items-start gap-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold">{label}</div>
                    <p className="text-xs text-white/75">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/auth/signup" variant="primary" size="md" className="w-full sm:w-auto" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Create account
              </Button>
              <Button href="/contact" variant="white" size="md" className="w-full sm:w-auto text-white border-white/40 hover:border-white/60">
                Talk to sales
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-10 shadow-card-soft">
            <div className="text-sm font-semibold text-zinc-500">Why teams stay</div>
            <h4 className="mt-2 text-2xl font-extrabold text-zinc-900">
              Clear, fair, and fast hiring decisions.
            </h4>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              carriX keeps everyone on the same page: recruiters, hiring managers, finance,
              and leadership. Transparent scoring and exports make approvals simpler.
            </p>

            <div className="mt-6 space-y-4 text-sm text-zinc-700">
              <div className="rounded-2xl border border-primary-100 bg-primary-50/70 p-4">
                <div className="text-sm font-semibold text-primary-700">Explainable by default</div>
                <p className="mt-1 text-sm text-primary-800/80">
                  Every score links to rationale and evidence so you can defend decisions.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="text-sm font-semibold text-zinc-900">Fairness in focus</div>
                <p className="mt-1 text-sm text-zinc-600">
                  Consistent criteria, version history, and lightweight bias checks to keep hiring equitable.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="text-sm font-semibold text-zinc-900">No heavy lift to adopt</div>
                <p className="mt-1 text-sm text-zinc-600">
                  Upload JDs, import CVs, tweak criteria, and share shortlists instantly. No lengthy setup.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
