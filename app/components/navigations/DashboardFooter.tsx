import Link from "next/link";
import { Facebook, Linkedin, Twitter, Youtube } from "lucide-react";

const footerLinks = [
  { label: "Product", href: "/dashboard" },
  { label: "Features", href: "/dashboard" },
  { label: "Pricing", href: "/pricing" },
  { label: "Integrations", href: "/dashboard" },
];

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com", Icon: Facebook },
  { label: "Twitter", href: "https://x.com", Icon: Twitter },
  { label: "LinkedIn", href: "https://linkedin.com", Icon: Linkedin },
  { label: "YouTube", href: "https://youtube.com", Icon: Youtube },
];

export default function DashboardFooter() {
  return (
    <footer className="rounded-xl border border-white/60 bg-white/70 px-4 py-4 text-sm text-[#6f7890] shadow-card-soft backdrop-blur sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-semibold text-[#6f7890] transition hover:text-primary-500"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-[#8a90a6]">
          <span>Trusted by talent teams at</span>
          <span className="rounded-full bg-[#f7ecff] px-3 py-1 text-[11px] font-semibold text-primary-600">Grayscale</span>
          <span className="rounded-full bg-[#e9f3ff] px-3 py-1 text-[11px] font-semibold text-[#3D64FF]">LightAI</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {socialLinks.map(({ label, href, Icon }) => (
            <Link
              key={label}
              href={href}
              aria-label={label}
              className="grid h-9 w-9 place-items-center rounded-xl border border-[#efe7f5] bg-white text-[#8a90a6] transition hover:-translate-y-0.5 hover:border-primary-200 hover:text-primary-500"
            >
              <Icon className="h-4 w-4" />
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-3 text-xs text-[#9aa0b5]">(c) 2026 Carriastic. All rights reserved.</div>
    </footer>
  );
}
