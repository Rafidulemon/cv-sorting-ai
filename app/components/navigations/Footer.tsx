import React from "react";
import { Facebook, Linkedin, Twitter, Youtube } from "lucide-react";
import Image from "next/image";

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} className="text-sm text-zinc-600 hover:text-zinc-900 transition">
    {children}
  </a>
);

const FooterTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="text-sm font-semibold text-zinc-900">{children}</div>
);

function PolygonBg() {
  // subtle bottom polygon-ish background
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-52 opacity-40">
      <svg viewBox="0 0 1440 260" className="h-full w-full" preserveAspectRatio="none">
        <path
          d="M0,220 L160,180 L300,210 L460,150 L640,220 L860,140 L1040,210 L1220,150 L1440,210 L1440,260 L0,260 Z"
          fill="#f2f2f7"
        />
        <path
          d="M0,240 L200,210 L360,240 L520,190 L720,250 L920,180 L1100,240 L1300,190 L1440,240 L1440,260 L0,260 Z"
          fill="#ececf6"
        />
      </svg>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="bg-white relative">
      {/* CTA Banner */}
      <div className="mx-auto max-w-6xl px-6 pt-14">
        <div className="overflow-hidden rounded-3xl bg-[#12061F] shadow-[0_25px_70px_rgba(0,0,0,0.18)]">
          <div className="relative bg-[radial-gradient(900px_500px_at_30%_30%,rgba(139,92,246,0.35),rgba(18,6,31,0.96))]">
            <div className="grid items-center gap-8 p-10 md:grid-cols-2">
              {/* Left content */}
              <div className="text-white">
                <h3 className="text-4xl font-extrabold leading-tight">
                  Try <br /> carriX
                </h3>
                <p className="mt-3 text-white/75">
                  Want to accelerate your hiring?
                </p>

                <a
                  href="/signup"
                  className="mt-8 inline-flex items-center gap-2 text-white font-semibold hover:opacity-90 transition"
                >
                  Start For Free <span aria-hidden>→</span>
                </a>
              </div>

              {/* Right mock image */}
              <div className="relative">
                <div className="rounded-2xl bg-white p-3 shadow-lg">
                  {/* Replace this image src with your product screenshot */}
                  <img
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80"
                    alt="carriX dashboard preview"
                    className="h-52 w-full rounded-xl object-cover md:h-60"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer content */}
      <div className="relative mx-auto max-w-6xl px-6 pb-10 pt-16">
        <PolygonBg />

        <div className="relative grid gap-12 md:grid-cols-4">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center">
                <Image
                  src="/logo/icon.png"
                  alt="carriX logo"
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>
              <div className="text-xl font-bold text-[#D80880]">carriX</div>
            </div>

            <div className="mt-6">
              <a
                href="mailto:hello@carrix.ai"
                className="text-sm font-medium text-violet-600 hover:text-violet-700"
              >
                hello@carrix.ai
              </a>
            </div>

            <div className="mt-10 text-sm text-zinc-500">
              © Copyright {new Date().getFullYear()}
            </div>

            {/* Social icons */}
            <div className="mt-6 flex items-center gap-4 text-zinc-500">
              <a href="#" aria-label="Facebook" className="hover:text-zinc-900 transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" aria-label="X" className="hover:text-zinc-900 transition">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" aria-label="LinkedIn" className="hover:text-zinc-900 transition">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" aria-label="YouTube" className="hover:text-zinc-900 transition">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <FooterTitle>Company</FooterTitle>
            <div className="mt-5 space-y-3 flex flex-col">
              <FooterLink href="/blog">Blog</FooterLink>
              <FooterLink href="/testimonials">Testimonials</FooterLink>
              <FooterLink href="/contact">Contact Us</FooterLink>
              <FooterLink href="/pricing">Pricing</FooterLink>
            </div>
          </div>

          {/* Resources */}
          <div>
            <FooterTitle>Resources</FooterTitle>
            <div className="mt-5 space-y-3 flex flex-col">
              <FooterLink href="/#features">Features</FooterLink>
              <FooterLink href="/faq">FAQ</FooterLink>
              <FooterLink href="/security">Security</FooterLink>
              <FooterLink href="/docs">Docs</FooterLink>
            </div>
          </div>

          {/* Most popular */}
          <div>
            <FooterTitle>Most Popular</FooterTitle>
            <div className="mt-5 space-y-3 flex flex-col">
              <FooterLink href="/blog/introducing-carrix">Introducing carriX</FooterLink>
              <FooterLink href="/blog/why-we-built-carrix">Why We Built carriX</FooterLink>
              <FooterLink href="/blog/ai-in-recruitment">AI in Recruitment</FooterLink>
              <FooterLink href="/blog/from-keywords-to-context">From Keywords to Context</FooterLink>
              <FooterLink href="/blog/the-human-touch">The Human Touch</FooterLink>
            </div>
          </div>
        </div>

        {/* Bottom links */}
        <div className="relative mt-14 flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-8 md:flex-row">
          <div className="text-sm text-zinc-500">Design and Developed by Carriastic</div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <a href="/privacy" className="text-zinc-600 hover:text-zinc-900 transition">
              Privacy Policy
            </a>
            <a href="/cookies" className="text-zinc-600 hover:text-zinc-900 transition">
              Cookie Policy
            </a>
            <a href="/terms" className="text-zinc-600 hover:text-zinc-900 transition">
              Terms and Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
