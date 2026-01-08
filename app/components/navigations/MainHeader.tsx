"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "../buttons/Button";

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
  const headerClass = isDark
    ? "absolute top-0 left-0 w-full z-50 bg-transparent"
    : "fixed top-0 left-0 w-full z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur shadow-[0_12px_30px_rgba(24,24,27,0.08)]";

  const titleClass = isDark ? "text-white" : "text-[#D80880]";
  const taglineClass = isDark ? "text-white/60" : "text-zinc-500";
  const loginClass = isDark
    ? "hidden md:inline-flex text-white/85 hover:text-white hover:bg-white/10 focus-visible:ring-white/40 focus-visible:ring-offset-0"
    : "hidden md:inline-flex text-zinc-700 hover:text-zinc-900";
  const signupClass = "hidden md:inline-flex";

  return (
    <header className={`${headerClass} transition-all duration-300`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2">
        <Link href="/" className="flex items-center gap-1 transition-colors duration-300 cursor-pointer">
          <div>
            <Image
              src={isDark ? "/logo/white_icon.png" : "/logo/icon.png"}
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
            isDark={isDark}
            isActive={pathname === "/"}
          />
          <NavLink
            label="Pricing"
            href="/pricing"
            isDark={isDark}
            isActive={pathname.startsWith("/pricing")}
          />
          <NavLink
            label="About Us"
            href="/about"
            isDark={isDark}
            isActive={pathname.startsWith("/about")}
          />
          <NavLink
            label="Blog"
            href="/blog"
            isDark={isDark}
            isActive={pathname.startsWith("/blog")}
          />
          <NavLink
            label="FAQ"
            href="/faq"
            isDark={isDark}
            isActive={pathname.startsWith("/faq")}
          />
          <NavLink
            label="Contact Us"
            href="/contact"
            isDark={isDark}
            isActive={pathname.startsWith("/contact")}
          />
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button href="/auth/login" variant="white" size="sm" className={loginClass}>
            Login
          </Button>

          <Button href="/auth/signup" variant="primary" size="sm" className={signupClass}>
            Signup
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
