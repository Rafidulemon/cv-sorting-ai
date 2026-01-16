"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Button from "../buttons/Button";

const HERO_SECTION_IDS: Record<string, string> = {
  "/": "home-hero",
  "/pricing": "pricing-hero",
  "/features": "features-hero",
};

type HeaderProps = {
  isDark?: boolean;
};

const NavLink = ({
  label,
  href,
  isDark,
  isActive,
}: {
  label: string;
  href: string;
  isDark: boolean;
  isActive: boolean;
}) => (
  <Link
    href={href}
    className={`relative text-sm font-medium transition-colors ${
      isActive
        ? isDark
          ? "text-white font-semibold"
          : "text-zinc-900 font-semibold"
        : isDark
        ? "text-white/80 hover:text-white"
        : "text-zinc-600 hover:text-zinc-900"
    } ${
      isActive
        ? "after:absolute after:-bottom-2 after:left-0 after:h-[3px] after:w-full after:rounded-full after:bg-gradient-to-r after:from-primary-500 after:via-rose-500 after:to-amber-300 after:content-['']"
        : ""
    }`}
  >
    {label}
  </Link>
);

const Header = ({ isDark = false }: HeaderProps) => {
  const pathname = usePathname();
  const { status } = useSession();
  const [isHeroActive, setIsHeroActive] = useState(
    !isDark && Boolean(HERO_SECTION_IDS[pathname])
  );

  useEffect(() => {
    if (isDark) return;

    const heroId = HERO_SECTION_IDS[pathname];
    if (!heroId) {
      setIsHeroActive(false);
      return;
    }

    let observer: IntersectionObserver | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let scrollListenerAttached = false;
    let handleScroll: (() => void) | null = null;

    const updateVisibilityFromRect = (heroEl: HTMLElement) => {
      const rect = heroEl.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 0;
      const topOffset = 96; // keep header dark until scrolled past its height
      const isVisible =
        rect.top < viewportHeight - topOffset && rect.bottom > topOffset;
      setIsHeroActive(isVisible);
    };

    const attachObserver = (heroEl: HTMLElement) => {
      updateVisibilityFromRect(heroEl);
      // Manual scroll/resize handler to keep the header in sync even if IntersectionObserver misses a tick.
      handleScroll = () => updateVisibilityFromRect(heroEl);
      window.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("resize", handleScroll);
      scrollListenerAttached = true;

      observer = new IntersectionObserver(
        ([entry]) => {
          // Fallback to rect checks to avoid false negatives on initial load.
          const rect = entry.boundingClientRect;
          const viewportHeight = window.innerHeight || 0;
          const topOffset = 96;
          const isVisible =
            entry.isIntersecting ||
            (rect.top < viewportHeight - topOffset && rect.bottom > topOffset);
          setIsHeroActive(isVisible);
        },
        { threshold: 0.25, rootMargin: "-96px 0px 0px 0px" }
      );
      observer.observe(heroEl);
    };

    const findHero = () => {
      const heroSection = document.getElementById(heroId);
      if (!heroSection) {
        setIsHeroActive(true);
        retryTimer = setTimeout(findHero, 80);
        return;
      }
      attachObserver(heroSection);
    };

    // Ensure dark header while the hero loads and while we search for the element.
    setIsHeroActive(true);
    findHero();
    return () => {
      if (retryTimer) clearTimeout(retryTimer);
      observer?.disconnect();
      if (scrollListenerAttached && handleScroll) {
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleScroll);
      }
    };
  }, [isDark, pathname]);

  const isDarkHeader = isDark || isHeroActive;
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const headerClass = isDarkHeader
    ? "absolute top-0 left-0 w-full z-50 bg-transparent"
    : "fixed top-0 left-0 w-full z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur shadow-[0_12px_30px_rgba(24,24,27,0.08)]";

  const titleClass = isDarkHeader ? "text-white" : "text-[#D80880]";
  const taglineClass = isDarkHeader ? "text-white/60" : "text-zinc-500";
  const loginClass = isDarkHeader
    ? "hidden md:inline-flex text-white/85 hover:text-white hover:bg-white/10 focus-visible:ring-white/40 focus-visible:ring-offset-0"
    : "hidden md:inline-flex text-zinc-700 hover:text-zinc-900";
  const signupClass = "hidden md:inline-flex";

  return (
    <header className={`${headerClass} transition-all duration-300`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2">
        <Link href="/" className="flex items-center gap-1 transition-colors duration-300 cursor-pointer">
          <div>
            <Image
              src={isDarkHeader ? "/logo/white_icon.png" : "/logo/icon.png"}
              alt="carriX logo"
              width={60}
              height={60}
              className="object-contain"
            />
          </div>
          <div className="leading-tight">
            <div className={`text-lg font-semibold transition-colors duration-300 ${titleClass}`}>
              carriX
            </div>
            <div className={`-mt-0.5 text-xs transition-colors duration-300 ${taglineClass}`}>
              Next-Gen Hiring
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <NavLink
            label="Home"
            href="/"
            isDark={isDarkHeader}
            isActive={pathname === "/"}
          />
          <NavLink
            label="Pricing"
            href="/pricing"
            isDark={isDarkHeader}
            isActive={pathname.startsWith("/pricing")}
          />
          <NavLink
            label="About Us"
            href="/about"
            isDark={isDarkHeader}
            isActive={pathname.startsWith("/about")}
          />
          <NavLink
            label="Blog"
            href="/blog"
            isDark={isDarkHeader}
            isActive={pathname.startsWith("/blog")}
          />
          <NavLink
            label="FAQ"
            href="/faq"
            isDark={isDarkHeader}
            isActive={pathname.startsWith("/faq")}
          />
          <NavLink
            label="Contact Us"
            href="/contact"
            isDark={isDarkHeader}
            isActive={pathname.startsWith("/contact")}
          />
        </nav>

        {/* Actions */}
        {isLoading ? (
          <div className="flex items-center gap-3">
            <span
              className={`hidden h-10 w-24 rounded-full md:inline-flex ${
                isDarkHeader ? "bg-white/15" : "bg-zinc-200/80"
              } animate-pulse`}
              aria-hidden
            />
            <span
              className={`hidden h-10 w-28 rounded-full md:inline-flex ${
                isDarkHeader ? "bg-white/15" : "bg-zinc-200/80"
              } animate-pulse`}
              aria-hidden
            />
          </div>
        ) : isAuthenticated ? (
          <div className="flex items-center gap-3">
            <Button href="/dashboard" variant="primary" size="sm" className="hidden md:inline-flex">
              Dashboard
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Button href="/auth/login" variant="white" size="sm" className={loginClass}>
              Login
            </Button>
            <Button href="/auth/signup" variant="primary" size="sm" className={signupClass}>
              Signup
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
