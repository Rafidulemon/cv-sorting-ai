import Button from "@/app/components/buttons/Button";
import { ArrowRight, Cookie, Mail, ShieldCheck, SlidersHorizontal, Sparkles } from "lucide-react";

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
    title: "1) What are cookies?",
    content: (
      <>
        <p>Cookies are small text files placed on your device to keep sites running smoothly and securely.</p>
        <p>We also use similar technologies (pixels, tags, local storage). Together, we call these “cookies.”</p>
      </>
    ),
  },
  {
    title: "2) Why we use cookies",
    content: (
      <>
        <p>We use cookies to run carriX, improve reliability, and understand product usage.</p>
        <BulletList
          items={[
            "Keep sessions secure and functional.",
            "Remember preferences and settings.",
            "Measure feature usage to improve performance.",
            "Assess communication effectiveness (where permitted).",
          ]}
        />
      </>
    ),
  },
  {
    title: "3) Types of cookies we use",
    content: (
      <div className="space-y-5">
        <div>
          <div className="font-semibold text-zinc-900">A. Strictly necessary</div>
          <p>Required for login, security, and core functionality.</p>
          <BulletList items={["Authentication and session management", "Security and fraud prevention", "Load balancing and uptime stability"]} />
        </div>
        <div>
          <div className="font-semibold text-zinc-900">B. Functional</div>
          <p>Improve usability and remember your choices.</p>
          <BulletList items={["Language or region preferences", "Saved UI settings", "Better continuity across sessions"]} />
        </div>
        <div>
          <div className="font-semibold text-zinc-900">C. Analytics</div>
          <p>Help us understand how the product is used to improve speed and reliability.</p>
          <BulletList items={["Pages visited and time spent", "Feature usage and interaction patterns", "Error monitoring and performance metrics"]} />
        </div>
        <div>
          <div className="font-semibold text-zinc-900">D. Marketing (if applicable)</div>
          <p>Used only where permitted and with consent to measure campaigns and relevance.</p>
        </div>
      </div>
    ),
  },
  {
    title: "4) Third-party cookies",
    content: (
      <>
        <p>Some cookies come from third-party tools (e.g., analytics, support, payments). These providers may see limited activity data.</p>
        <p>Review their policies for details on how they handle data.</p>
      </>
    ),
  },
  {
    title: "5) Managing your cookie preferences",
    content: (
      <>
        <p>You control non-essential cookies and can adjust settings anytime.</p>
        <BulletList
          items={[
            "Update browser settings to block or delete cookies.",
            "Use browser extensions that manage tracking technologies.",
            "Respond to consent banners where applicable.",
          ]}
        />
        <p>Disabling certain cookies may affect site or product performance.</p>
      </>
    ),
  },
  {
    title: "6) Do Not Track signals",
    content: (
      <p>
        There is no industry standard for DNT signals. At this time, we do not respond uniformly to DNT requests, but we continue to evaluate evolving standards.
      </p>
    ),
  },
  {
    title: "7) Updates to this Cookie Policy",
    content: (
      <>
        <p>We may update this policy to reflect changes in technology, law, or our practices.</p>
        <p>When updated, we revise the “Last updated” date and may provide additional notice for material changes.</p>
      </>
    ),
  },
  {
    title: "8) Contact us",
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

export default function CookiePolicyPage() {
  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(1000px_480px_at_15%_0%,rgba(216,8,128,0.12),transparent),radial-gradient(900px_520px_at_90%_0%,rgba(99,102,241,0.12),transparent)]" />
        <div className="relative mx-auto max-w-6xl px-6 pt-28 pb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-200/60 bg-primary-50/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-700">
            <span className="h-2 w-2 rounded-full bg-primary-500" />
            Cookie Policy
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-5">
              <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 md:text-5xl">
                Clear on cookies. Control stays with you.
              </h1>
              <p className="max-w-2xl text-base text-zinc-600 md:text-lg">
                This Cookie Policy explains how Carriastic uses cookies and similar technologies in carriX.
                We minimize non-essential tracking and make controls accessible.
              </p>

              <div className="flex flex-wrap gap-3 text-sm font-semibold text-zinc-700">
                <span className="rounded-full bg-primary-50 px-4 py-2 text-primary-700 ring-1 ring-primary-100">
                  Security-first
                </span>
                <span className="rounded-full bg-emerald-50 px-4 py-2 text-emerald-700 ring-1 ring-emerald-200">
                  Consent-aware
                </span>
                <span className="rounded-full bg-amber-50 px-4 py-2 text-amber-700 ring-1 ring-amber-200">
                  No data selling
                </span>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button href="/privacy" variant="primary" size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  View Privacy
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
                  { label: "Contact", value: "hello@carrix.ai", icon: Mail },
                  { label: "Data stance", value: "No selling of personal data", icon: Sparkles },
                  { label: "Control", value: "Manage cookies anytime", icon: SlidersHorizontal },
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
            { title: "Essential first", desc: "Only the cookies needed to keep carriX secure and running by default." },
            { title: "Consent matters", desc: "Non-essential cookies are limited and subject to applicable consent." },
            { title: "Explainable use", desc: "We describe what each category does—no surprises." },
            { title: "You’re in control", desc: "Manage cookies in your browser or through consent banners." },
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
                  <h3 className="mt-2 text-2xl font-extrabold text-zinc-900 md:text-3xl">Cookies keep things running.</h3>
                  <p className="mt-2 text-sm text-zinc-700">
                    Essential cookies power sessions and security. Optional ones improve performance and insights. You decide what’s enabled.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button href="/privacy" variant="primary" size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    View Privacy
                  </Button>
                  <Button href="/contact" variant="secondary" size="md">
                    Contact us
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
