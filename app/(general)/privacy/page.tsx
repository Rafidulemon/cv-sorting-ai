import Button from "@/app/components/buttons/Button";
import { Mail, ShieldCheck, Sparkles, FileCheck, ArrowRight } from "lucide-react";

type Section = {
  title: string;
  content: React.ReactNode;
};

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="ml-5 list-disc space-y-2 text-sm text-zinc-700">
      {items.map((it) => (
        <li key={it}>{it}</li>
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
    title: "1) Who this policy applies to",
    content: (
      <>
        <p>This policy covers visitors, customers, and candidates whose data is processed in carriX.</p>
        <BulletList
          items={[
            "Account owners and team members who sign up to use the Service (“Customers”).",
            "Candidates whose CVs/resumes or related data are uploaded to the Service by Customers (“Candidates”).",
            "Website visitors who browse marketing pages or contact us (“Visitors”).",
          ]}
        />
      </>
    ),
  },
  {
    title: "2) Information we collect",
    content: (
      <div className="space-y-5">
        <div>
          <div className="font-semibold text-zinc-900">A. Account & contact information</div>
          <BulletList
            items={[
              "Name, email address, company name, job title, and basic profile information.",
              "Billing details (handled through a payment processor; we typically do not store full card numbers).",
              "Support messages and communications you send us.",
            ]}
          />
        </div>
        <div>
          <div className="font-semibold text-zinc-900">B. Customer-provided content</div>
          <p>
            Customers may upload job descriptions, scoring criteria, and candidate resumes/CVs. This can include personal
            data about Candidates (e.g., work history, education, skills, contact details).
          </p>
        </div>
        <div>
          <div className="font-semibold text-zinc-900">C. Usage & device information</div>
          <BulletList
            items={[
              "Log data such as IP address, browser type, pages viewed, and timestamps.",
              "Device identifiers and approximate location (derived from IP).",
              "Performance and diagnostic data (crash logs, error reports).",
            ]}
          />
        </div>
        <div>
          <div className="font-semibold text-zinc-900">D. Cookies & similar technologies</div>
          <p>We use cookies to maintain sessions, remember preferences, and measure site usage. You can manage cookies in your browser.</p>
        </div>
      </div>
    ),
  },
  {
    title: "3) How we use information",
    content: (
      <>
        <p>We use information to operate, secure, and improve carriX.</p>
        <BulletList
          items={[
            "Provide, operate, and maintain the Service (e.g., login, resume processing, shortlisting).",
            "Improve performance, quality, reliability, and user experience.",
            "Provide customer support, respond to inquiries, and communicate product updates.",
            "Detect, prevent, and investigate fraud, abuse, security incidents, and violations of terms.",
            "Comply with legal obligations and enforce our agreements.",
          ]}
        />
        <p className="pt-2">
          <span className="font-semibold text-zinc-900">AI processing.</span> carriX uses automated systems to analyze resumes/CVs and job criteria to
          generate scores, rankings, and explanations. Customers control which data they upload and how results are used in their hiring process.
        </p>
      </>
    ),
  },
  {
    title: "4) Legal bases (where applicable)",
    content: (
      <>
        <p>Where required, we process data under one or more of the following bases:</p>
        <BulletList
          items={[
            "Performance of a contract (to provide the Service you requested).",
            "Legitimate interests (e.g., improving the Service, security, preventing fraud).",
            "Consent (e.g., optional marketing communications or non-essential cookies, where required).",
            "Legal obligations (e.g., recordkeeping, responding to lawful requests).",
          ]}
        />
      </>
    ),
  },
  {
    title: "5) How we share information",
    content: (
      <>
        <p>We do not sell personal information. We may share data only when needed to run the Service or where required by law.</p>
        <BulletList
          items={[
            "Service providers: hosting, analytics, support tools, payment processors.",
            "Customer teams: within a Customer’s organization as part of recruiting collaboration.",
            "Legal and safety: to comply with law, protect rights, investigate fraud, or respond to lawful requests.",
            "Business transfers: if we undergo a merger, acquisition, or asset sale.",
          ]}
        />
      </>
    ),
  },
  {
    title: "6) Data retention",
    content: (
      <>
        <p>We keep data only as long as needed for the purposes described in this policy, unless law requires longer retention.</p>
        <BulletList
          items={[
            "Account data is retained while your account is active and for a reasonable period thereafter.",
            "Customer content (resumes/CVs, job data) is retained according to Customer settings and operational needs.",
            "Logs and security records may be kept longer to protect against fraud and abuse.",
          ]}
        />
        <p>Customers control retention for Candidate data. Candidates should contact the organization that uploaded their resume for removal requests.</p>
      </>
    ),
  },
  {
    title: "7) Security",
    content: (
      <>
        <p>We apply administrative, technical, and organizational measures to protect data.</p>
        <BulletList
          items={[
            "Encryption in transit (TLS) and, where applicable, encryption at rest.",
            "Access controls and least-privilege practices.",
            "Monitoring and incident response procedures.",
          ]}
        />
        <p>No method is 100% secure. Keep your credentials confidential.</p>
      </>
    ),
  },
  {
    title: "8) Candidate data & hiring decisions",
    content: (
      <>
        <p>carriX supports screening and shortlisting; Customers are responsible for hiring decisions and compliance.</p>
        <BulletList
          items={[
            "Customers decide what criteria to use and how results are interpreted.",
            "Automated scores are recommendations and should be reviewed by humans before final decisions.",
            "Customers should ensure fair, lawful, and non-discriminatory hiring practices.",
          ]}
        />
      </>
    ),
  },
  {
    title: "9) Your choices and rights",
    content: (
      <>
        <p>Depending on your jurisdiction, you may have rights such as access, correction, deletion, objection, restriction, portability, and consent withdrawal.</p>
        <BulletList
          items={[
            "Customers can update account details in settings or by contacting support.",
            "Candidates should contact the hiring organization that uploaded their resume.",
            "You may opt out of marketing emails using the unsubscribe link.",
          ]}
        />
        <p>
          To exercise rights, contact{" "}
          <a className="font-semibold text-primary-700 hover:text-primary-800" href="mailto:hello@carrix.ai">
            hello@carrix.ai
          </a>
          .
        </p>
      </>
    ),
  },
  {
    title: "10) International transfers",
    content: <p>We may process and store information in countries other than your own and use appropriate safeguards for cross-border transfers where required.</p>,
  },
  {
    title: "11) Children’s privacy",
    content: (
      <p>
        The Service is not directed to children under 13 (or the minimum age required by your jurisdiction). If you believe a child provided data, contact us and we will take
        appropriate steps to delete it.
      </p>
    ),
  },
  {
    title: "12) Changes to this Privacy Policy",
    content: (
      <p>
        We may update this policy periodically. We will post updates here with a revised “Last updated” date. Material changes may include additional notice.
      </p>
    ),
  },
  {
    title: "13) Contact us",
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

export default function PrivacyPage() {
  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(1000px_480px_at_15%_0%,rgba(216,8,128,0.12),transparent),radial-gradient(900px_520px_at_90%_0%,rgba(99,102,241,0.12),transparent)]" />
        <div className="relative mx-auto max-w-6xl px-6 pt-28 pb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-200/60 bg-primary-50/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-700">
            <span className="h-2 w-2 rounded-full bg-primary-500" />
            Privacy & Security
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-5">
              <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 md:text-5xl">
                Privacy first. Explainable AI by design.
              </h1>
              <p className="max-w-2xl text-base text-zinc-600 md:text-lg">
                This policy explains how Carriastic (“we”, “us”) handles information in carriX—our hiring and resume intelligence platform. Transparency and control guide every feature we ship.
              </p>

              <div className="flex flex-wrap gap-3 text-sm font-semibold text-zinc-700">
                <span className="rounded-full bg-primary-50 px-4 py-2 text-primary-700 ring-1 ring-primary-100">
                  No data selling
                </span>
                <span className="rounded-full bg-emerald-50 px-4 py-2 text-emerald-700 ring-1 ring-emerald-200">
                  Explainable scoring
                </span>
                <span className="rounded-full bg-amber-50 px-4 py-2 text-amber-700 ring-1 ring-amber-200">
                  Customer-controlled retention
                </span>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button href="/contact" variant="primary" size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Talk to us
                </Button>
                <Button href="/faq" variant="secondary" size="md">
                  Visit FAQ
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-card-soft">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Last updated", value: lastUpdated, icon: ShieldCheck },
                  { label: "Contact", value: "hello@carrix.ai", icon: Mail },
                  { label: "Data stance", value: "We don’t sell personal data", icon: Sparkles },
                  { label: "Data controls", value: "Customer-managed retention", icon: FileCheck },
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
            { title: "No selling data", desc: "Your data is used to run carriX and improve reliability—never sold." },
            { title: "Security posture", desc: "Encryption, access controls, and monitoring for safe handling." },
            { title: "Explainable AI", desc: "Every score links to rationale so teams can audit decisions." },
            { title: "You’re in control", desc: "Customers choose what to upload and how long to keep it." },
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
                  <h3 className="mt-2 text-2xl font-extrabold text-zinc-900 md:text-3xl">We collect only what’s needed.</h3>
                  <p className="mt-2 text-sm text-zinc-700">
                    carrIX uses minimal data to operate, support users, and improve performance. Customers control uploads and retention for candidate data.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button href="/contact" variant="primary" size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    Contact us
                  </Button>
                  <Button href="/faq" variant="secondary" size="md">
                    Visit FAQ
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
