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

    let observer: IntersectionObserver | null = null;
    let cancelled = false;

    const attachObserver = () => {
      const hero = document.getElementById(heroId);
      if (!hero) {
        // Keep dark styling until the hero mounts to avoid flashes.
        setIsDark(true);
        if (!cancelled) {
          setTimeout(attachObserver, 80);
        }
        return;
      }

      observer = new IntersectionObserver(
        ([entry]) => {
          setIsDark(entry.isIntersecting);
        },
        { threshold: 0.4 }
      );

      observer.observe(hero);
    };

    attachObserver();
    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [pathname]);

  return <Header isDark={isDark} />;
}
