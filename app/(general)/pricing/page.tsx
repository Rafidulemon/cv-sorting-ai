import PricingComparisonSection from "@/app/components/pricing/PricingComparisonSection";
import Button from "@/app/components/buttons/Button";
import { WaveDivider } from "@/app/functions/WaveDivider";

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium text-white/85">
      {children}
    </span>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="text-base font-semibold text-zinc-900">{q}</div>
      <div className="mt-2 text-sm leading-relaxed text-zinc-600">{a}</div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* HERO */}
      <section className="relative overflow-hidden bg-hero-base" id="pricing-hero">
        <div className="absolute inset-0 bg-hero-overlay" />

        <div className="relative mx-auto max-w-6xl px-6 pt-36 pb-20 text-center">
          <div className="flex justify-center">
            <Badge>Transparent pricing • Scale as you grow</Badge>
          </div>

          <h1 className="mt-6 text-white text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Simple Plans for
            <br />
            AI Resume Screening
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-white/75 text-base md:text-lg">
            Choose a plan that fits your hiring volume. Upgrade anytime.
            Use carriX to screen resumes, rank candidates, and build shortlists faster.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button href="#plans" variant="primary" size="md" className="min-w-[220px]">
              View Plans
            </Button>
            <Button
              href="/contact"
              variant="white"
              size="md"
              className="min-w-[220px] border-white/60 text-white hover:border-white/70"
            >
              Contact Sales
            </Button>
          </div>
        </div>

        <WaveDivider />
      </section>

      {/* PRICING SECTION */}
      <PricingComparisonSection />

      {/* FAQ */}
      <section className="bg-white py-20" id="faq">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <div className="text-sm font-semibold tracking-widest text-zinc-500">
              FAQ
            </div>
            <h2 className="mt-3 text-3xl md:text-4xl font-extrabold text-zinc-900">
              Pricing questions, answered
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-zinc-600">
              Everything you need to know about plans, billing, and credits.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <FAQItem
              q="How does monthly vs annual billing work?"
              a="Annual billing is discounted (up to 20%). You can also choose month-to-month billing on paid plans."
            />
            <FAQItem
              q="What counts as a resume?"
              a="Each uploaded candidate resume/CV analyzed by carriX counts as one resume credit."
            />
            <FAQItem
              q="Can I add more credits?"
              a="Yes—add credits anytime. Paid plans include lower per-resume credit pricing."
            />
            <FAQItem
              q="Can I upgrade or downgrade later?"
              a="Absolutely. You can change plans anytime. Upgrades take effect immediately."
            />
            <FAQItem
              q="Do you support teams?"
              a="Yes. Standard includes 3 seats; Professional supports larger teams. Enterprise options can be added."
            />
            <FAQItem
              q="Do you offer enterprise pricing?"
              a="Yes. If you need higher volume, SSO, custom integrations, or SLA, contact sales."
            />
          </div>
        </div>
      </section>
    </div>
  );
}
