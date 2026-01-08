import Button from "@/app/components/buttons/Button";
import { ArrowRight, FileCheck, Gavel, ShieldCheck, Sparkles } from "lucide-react";

type Section = {
  title: string;
  content: React.ReactNode;
};

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="ml-5 list-disc space-y-2 text-sm text-zinc-700">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-card-soft">
      <h2 className="text-xl font-extrabold text-zinc-900">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-zinc-600">{children}</div>
    </section>
  );
}

const lastUpdated = "January 8, 2026";

const sections: Section[] = [
  {
    title: "1) Acceptance of Terms",
    content: (
      <>
        <p>By accessing or using the Service, you agree to these Terms. If you do not agree, do not use the Service.</p>
        <p>If you use carriX on behalf of an organization, you confirm you are authorized to bind that organization.</p>
      </>
    ),
  },
  {
    title: "2) Description of the Service",
    content: (
      <>
        <p>carriX is an AI-powered resume screening and shortlisting platform that generates scores, rankings, and insights.</p>
        <p>carriX provides decision-support only; Customers remain responsible for hiring decisions.</p>
      </>
    ),
  },
  {
    title: "3) Eligibility & Accounts",
    content: (
      <>
        <BulletList
          items={[
            "You must be at least 18 years old.",
            "Maintain the confidentiality of your credentials.",
            "You are responsible for all activity under your account.",
          ]}
        />
        <p>We may suspend or terminate accounts that violate these Terms.</p>
      </>
    ),
  },
  {
    title: "4) Customer Content & Responsibilities",
    content: (
      <>
        <p>Customers may upload job descriptions, resumes/CVs, criteria, and other content (“Customer Content”).</p>
        <BulletList
          items={[
            "You have the right to upload and process Customer Content.",
            "You comply with employment, data protection, and anti-discrimination laws.",
            "You will not upload unlawful, harmful, or misleading content.",
          ]}
        />
        <p>We do not verify the accuracy or legality of Customer Content.</p>
      </>
    ),
  },
  {
    title: "5) AI Processing & Limitations",
    content: (
      <>
        <p>carriX uses automated systems and models to analyze resumes and criteria.</p>
        <BulletList
          items={[
            "AI outputs are recommendations, not guarantees.",
            "Results depend on input quality and defined criteria.",
            "Customers must review outputs before hiring decisions.",
          ]}
        />
        <p>No AI system is error-free; use the Service responsibly.</p>
      </>
    ),
  },
  {
    title: "6) Acceptable Use",
    content: (
      <>
        <p>You agree not to:</p>
        <BulletList
          items={[
            "Use the Service for unlawful or discriminatory hiring practices.",
            "Reverse engineer, copy, or misuse the Service.",
            "Interfere with security, integrity, or performance.",
            "Violate privacy or intellectual property rights using the Service.",
          ]}
        />
      </>
    ),
  },
  {
    title: "7) Fees, Billing & Payments",
    content: (
      <>
        <p>Certain features may require payment. Pricing is on our Pricing page or agreed separately.</p>
        <BulletList items={["Fees are non-refundable unless required by law or stated otherwise.", "You are responsible for taxes.", "Non-payment may suspend or terminate access."]} />
      </>
    ),
  },
  {
    title: "8) Intellectual Property",
    content: (
      <>
        <p>The Service (software, design, branding, content excluding Customer Content) is owned by Carriastic.</p>
        <p>We grant a limited, non-exclusive, non-transferable license to use the Service under these Terms.</p>
      </>
    ),
  },
  {
    title: "9) Confidentiality",
    content: (
      <p>Each party will protect confidential information disclosed during use of the Service and not disclose it except as permitted by law or agreement.</p>
    ),
  },
  {
    title: "10) Suspension & Termination",
    content: (
      <>
        <p>We may suspend or terminate access if you violate these Terms or pose a security/legal risk.</p>
        <p>Upon termination, your right to use the Service stops immediately.</p>
      </>
    ),
  },
  {
    title: "11) Disclaimers",
    content: (
      <p>The Service is provided “as is” and “as available.” We disclaim all warranties, express or implied, including fitness for a particular purpose and non-infringement.</p>
    ),
  },
  {
    title: "12) Limitation of Liability",
    content: (
      <>
        <p>To the fullest extent permitted by law, Carriastic is not liable for indirect, incidental, consequential, or special damages.</p>
        <p>Total liability will not exceed amounts paid by you in the twelve months preceding the claim.</p>
      </>
    ),
  },
  {
    title: "13) Indemnification",
    content: (
      <p>You agree to indemnify and hold harmless Carriastic from claims, damages, and expenses arising from your use of the Service or violation of these Terms.</p>
    ),
  },
  {
    title: "14) Governing Law",
    content: (
      <p>These Terms are governed by the laws applicable to Carriastic, without regard to conflict of law principles.</p>
    ),
  },
  {
    title: "15) Changes to These Terms",
    content: (
      <p>We may update these Terms. Continued use after changes become effective means you accept the revised Terms.</p>
    ),
  },
  {
    title: "16) Contact Information",
    content: (
      <BulletList
        items={[
          "Email: hello@carrix.ai",
          "Support: support@carrix.ai",
          "Company: Carriastic",
        ]}
      />
    ),
  },
];

export default function TermsPage() {
  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(1000px_480px_at_15%_0%,rgba(216,8,128,0.12),transparent),radial-gradient(900px_520px_at_90%_0%,rgba(99,102,241,0.12),transparent)]" />
        <div className="relative mx-auto max-w-6xl px-6 pt-28 pb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-200/60 bg-primary-50/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-700">
            <span className="h-2 w-2 rounded-full bg-primary-500" />
            Terms & Conditions
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-5">
              <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 md:text-5xl">
                Clear guardrails for using carriX.
              </h1>
              <p className="max-w-2xl text-base text-zinc-600 md:text-lg">
                These Terms govern how you use carriX, our hiring and resume intelligence platform. Please review them before proceeding.
              </p>

              <div className="flex flex-wrap gap-3 text-sm font-semibold text-zinc-700">
                <span className="rounded-full bg-primary-50 px-4 py-2 text-primary-700 ring-1 ring-primary-100">
                  Responsible AI
                </span>
                <span className="rounded-full bg-emerald-50 px-4 py-2 text-emerald-700 ring-1 ring-emerald-200">
                  Human oversight
                </span>
                <span className="rounded-full bg-amber-50 px-4 py-2 text-amber-700 ring-1 ring-amber-200">
                  Security-first
                </span>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button href="/privacy" variant="primary" size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Privacy Policy
                </Button>
                <Button href="/contact" variant="secondary" size="md">
                  Contact us
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-card-soft">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Last updated", value: lastUpdated, icon: ShieldCheck },
                  { label: "Contact", value: "hello@carrix.ai", icon: Sparkles },
                  { label: "Responsible use", value: "Human-reviewed decisions", icon: FileCheck },
                  { label: "Governance", value: "Fair + secure by design", icon: Gavel },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</div>
                      <div className="text-sm font-semibold text-zinc-900">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Decision support", desc: "AI suggestions need human review before hiring choices." },
            { title: "Security-first", desc: "We protect access, sessions, and data integrity." },
            { title: "No data selling", desc: "Your data powers your workflows—never sold." },
            { title: "Fair use required", desc: "Comply with employment, privacy, and anti-discrimination laws." },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-card-soft">
              <div className="text-base font-semibold text-zinc-900">{item.title}</div>
              <p className="mt-2 text-sm text-zinc-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-6">
          {sections.map((section) => (
            <SectionCard key={section.title} title={section.title}>
              {section.content}
            </SectionCard>
          ))}

          <div className="relative overflow-hidden rounded-4xl bg-gradient-to-r from-primary-500 via-rose-500 to-amber-300 p-[1px] shadow-[0_22px_50px_rgba(216,8,128,0.28)]">
            <div className="rounded-4xl bg-white px-8 py-9 md:px-10">
              <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-center">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">Summary</div>
                  <h3 className="mt-2 text-2xl font-extrabold text-zinc-900 md:text-3xl">Use carriX responsibly and securely.</h3>
                  <p className="mt-2 text-sm text-zinc-700">
                    You own your hiring decisions. We provide the technology with explainable, secure AI. Keep humans in the loop and follow applicable laws.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button href="/privacy" variant="primary" size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    Privacy Policy
                  </Button>
                  <Button href="/cookies" variant="secondary" size="md">
                    Cookie Policy
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
