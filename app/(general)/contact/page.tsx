"use client";

import React from "react";
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock,
  Facebook,
  Headphones,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Users,
  Youtube,
} from "lucide-react";
import ContactForm from "@/app/components/contact/ContactForm";
import PageTitle from "@/app/components/typography/PageTitle";

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

type ContactCardProps = {
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  icon: IconType;
  tone: string;
};

type StatProps = {
  label: string;
  value: string;
  icon: IconType;
};

const contactCards: ContactCardProps[] = [
  {
    title: "Sales",
    description: "Request a tailored demo for your team.",
    href: "mailto:hello@carrix.ai",
    linkLabel: "hello@carrix.ai",
    icon: Building2,
    tone: "bg-violet-50 text-violet-600",
  },
  {
    title: "Support",
    description: "Get help with onboarding or troubleshooting.",
    href: "mailto:support@carrix.ai",
    linkLabel: "support@carrix.ai",
    icon: Headphones,
    tone: "bg-sky-50 text-sky-600",
  },
  {
    title: "Press",
    description: "Media inquiries and brand assets.",
    href: "mailto:press@carrix.ai",
    linkLabel: "press@carrix.ai",
    icon: Mail,
    tone: "bg-rose-50 text-rose-600",
  },
  {
    title: "Partnerships",
    description: "Talk integrations and hiring collaborations.",
    href: "mailto:partners@carrix.ai",
    linkLabel: "partners@carrix.ai",
    icon: Users,
    tone: "bg-emerald-50 text-emerald-600",
  },
];

const quickStats: StatProps[] = [
  {
    label: "Average response time",
    value: "Under 24 hours",
    icon: Clock,
  },
  {
    label: "Phone",
    value: "+1 (415) 555-0136",
    icon: Phone,
  },
  {
    label: "HQ",
    value: "San Francisco, CA",
    icon: MapPin,
  },
];

function DottedHeaderBg() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-60 overflow-hidden">
      <div
        className="h-full w-full opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(rgba(0,0,0,0.12) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          backgroundPosition: "0 0",
        }}
      />
      <div className="absolute left-[20%] top-[30%] h-1.5 w-1.5 rounded-full bg-orange-400/60" />
      <div className="absolute left-[35%] top-[60%] h-1.5 w-1.5 rounded-full bg-emerald-400/60" />
      <div className="absolute left-[55%] top-[35%] h-1.5 w-1.5 rounded-full bg-violet-500/60" />
      <div className="absolute left-[70%] top-[55%] h-1.5 w-1.5 rounded-full bg-rose-500/60" />
      <div className="absolute left-[82%] top-[40%] h-1.5 w-1.5 rounded-full bg-sky-400/60" />
    </div>
  );
}

function ContactCard({
  title,
  description,
  href,
  linkLabel,
  icon: Icon,
  tone,
}: ContactCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-md">
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-lg font-semibold text-zinc-900">{title}</div>
      <p className="mt-2 text-sm text-zinc-600">{description}</p>
      <a
        href={href}
        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 transition group-hover:text-violet-600"
      >
        {linkLabel}
        <ArrowUpRight className="h-4 w-4" />
      </a>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: StatProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white/80 px-4 py-4 shadow-sm">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {label}
        </div>
        <div className="text-sm font-semibold text-zinc-900">{value}</div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="relative bg-white">
      <DottedHeaderBg />

      <div className="relative mx-auto max-w-6xl px-6 pt-28 pb-24">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <PageTitle title="Contact"/>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
              Give us a shout. We answer quickly.
            </h1>
            <p className="mt-4 max-w-xl text-sm text-zinc-600 sm:text-base">
              Whether you need a product walkthrough, pricing guidance, or help
              getting started, our team is ready to help your hiring flow.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {quickStats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <div className="absolute inset-0 bg-[radial-gradient(500px_220px_at_80%_0%,rgba(139,92,246,0.12),transparent)]" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-zinc-900">Need urgent help?</div>
                  <p className="mt-2 text-sm text-zinc-600">
                    Our team is available Monday to Friday for quick response.
                  </p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                  <Phone className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50/70 p-4 text-sm text-zinc-700">
                <div className="text-xs font-semibold uppercase tracking-wide text-violet-700">
                  Priority hotline
                </div>
                <div className="mt-2 text-base font-semibold text-zinc-900">
                  +1 (415) 555-0136
                </div>
                <div className="mt-2 text-xs text-zinc-500">9am - 6pm PT</div>
              </div>
              <div className="mt-6 flex items-center gap-3 text-sm text-zinc-600">
                <Clock className="h-4 w-4 text-violet-600" />
                Avg. response time under 24 hours
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {contactCards.map((card) => (
            <ContactCard key={card.title} {...card} />
          ))}
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <ContactForm />

          <div className="space-y-8">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Headquarters
                  </div>
                  <div className="mt-2 text-lg font-semibold text-zinc-900">
                    Carriastic HQ
                  </div>
                  <div className="mt-2 text-sm text-zinc-600">
                    55 Market Street, Suite 18
                    <br />
                    San Francisco, CA 94105
                  </div>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
                  <MapPin className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-6 h-40 overflow-hidden rounded-xl border border-zinc-200 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.25),transparent_60%),radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.25),transparent_55%),linear-gradient(180deg,#f8fafc,#ffffff)]" />
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-700"
              >
                View on Google Maps
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="text-lg font-semibold text-zinc-900">What happens next</div>
              <div className="mt-4 space-y-3 text-sm text-zinc-600">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
                  <span>We review your message within one business day.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
                  <span>We match you with a product expert or support specialist.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
                  <span>We send a clear next step and timeline for follow-up.</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="text-lg font-semibold text-zinc-900">Follow us</div>
              <div className="mt-4 flex items-center gap-5 text-zinc-900">
                <a href="#" aria-label="Facebook" className="hover:opacity-70 transition">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" aria-label="X" className="hover:opacity-70 transition">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" aria-label="LinkedIn" className="hover:opacity-70 transition">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" aria-label="YouTube" className="hover:opacity-70 transition">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
