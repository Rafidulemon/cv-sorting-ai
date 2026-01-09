import Image from "next/image";
import Link from "next/link";
import { Facebook, Linkedin, Twitter, Youtube } from "lucide-react";

const footerLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Cookie Policy", href: "/cookies" },
  { label: "Terms and Conditions", href: "/terms" },
];

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com", Icon: Facebook },
  { label: "Twitter", href: "https://x.com", Icon: Twitter },
  { label: "LinkedIn", href: "https://linkedin.com", Icon: Linkedin },
  { label: "YouTube", href: "https://youtube.com", Icon: Youtube },
];

export default function AdminFooter() {
  return (
    <footer className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-4 text-sm text-slate-300 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.8)] backdrop-blur sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-semibold text-slate-300 transition hover:text-primary-200"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-row items-center justify-center gap-2 text-sm font-semibold text-slate-300 md:flex-1 md:justify-center">
          <span className="text-slate-400">Design and Developed by</span>
          <Link
            href="https://carriasticapp.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2"
          >
            <Image
              src="/logo/white_logo.png"
              alt="Carriastic"
              width={150}
              height={32}
              className="h-8 w-auto"
            />
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {socialLinks.map(({ label, href, Icon }) => (
            <Link
              key={label}
              href={href}
              aria-label={label}
              className="grid h-9 w-9 place-items-center rounded-xl border border-slate-800 bg-slate-800/70 text-slate-200 transition hover:-translate-y-0.5 hover:border-primary-300 hover:text-primary-200"
            >
              <Icon className="h-4 w-4" />
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
