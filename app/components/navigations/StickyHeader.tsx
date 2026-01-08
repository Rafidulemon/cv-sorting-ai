"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "./MainHeader";

const HERO_SECTION_IDS: Record<string, string> = {
  "/": "home-hero",
  "/pricing": "pricing-hero",
};

export default function StickyHeader() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(Boolean(HERO_SECTION_IDS[pathname]));

  useEffect(() => {
    const heroId = HERO_SECTION_IDS[pathname];
    if (!heroId) {
      setIsDark(false);
      return;
    }

    const hero = document.getElementById(heroId);
    if (!hero) {
      setIsDark(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsDark(entry.isIntersecting);
      },
      { threshold: 0.4 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, [pathname]);

  return <Header isDark={isDark} />;
}
