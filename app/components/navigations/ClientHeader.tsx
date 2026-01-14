"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Bell, Menu, RefreshCw, Search, X } from "lucide-react";

type ClientHeaderProps = {
  isNavOpen: boolean;
  onToggleNav: () => void;
};

type CreditPayload = {
  remaining: number;
  total: number;
  used?: number;
  plan?: string;
};

export default function ClientHeader({
  isNavOpen,
  onToggleNav,
}: ClientHeaderProps) {
  const { data: session } = useSession();
  const [credits, setCredits] = useState<CreditPayload | null>(null);
  const [isLoadingCredits, setIsLoadingCredits] = useState(true);
  const defaultAvatar = "/images/default_dp.png";
  const avatarBaseUrlRef = useRef((process.env.NEXT_PUBLIC_S3_PUBLIC_BASE_URL ?? "").replace(/\/+$/, ""));
  const resolveAvatar = useCallback(
    (value?: string | null) => {
      const trimmed = value?.trim();
      if (!trimmed) return defaultAvatar;
      if (/^https?:\/\//.test(trimmed) || trimmed.startsWith("data:")) return trimmed;
      const normalized = trimmed.replace(/^\/+/, "");
      const normalizedStorage = normalized.replace(/^uploads\/profile-avatars\//, "uploads/profile-picture/");
      if (normalizedStorage.startsWith("uploads/")) {
        if (avatarBaseUrlRef.current) return `${avatarBaseUrlRef.current}/${normalizedStorage}`;
        return `/${normalizedStorage}`;
      }
      if (trimmed.startsWith("/")) return trimmed;
      return avatarBaseUrlRef.current ? `${avatarBaseUrlRef.current}/${normalizedStorage}` : `/${normalizedStorage}`;
    },
    [defaultAvatar]
  );
  const [avatarSrc, setAvatarSrc] = useState(defaultAvatar);
  const isFetchingAvatar = useRef(false);

  useEffect(() => {
    let isMounted = true;

    loadCredits().catch(() => {});
    return () => {
      isMounted = false;
    };
    async function loadCredits() {
      try {
        const response = await fetch("/api/credits/balance");
        if (!response.ok) {
          if (isMounted) setCredits(null);
          return;
        }
        const data = await response.json();
        console.log("Data: ", data);
        if (isMounted) {
          setCredits({
            remaining: data.remaining,
            total: data.total,
            used: data.used,
            plan: data.plan,
          });
        }
      } catch (error) {
        console.error(error);
        if (isMounted) setCredits(null);
      } finally {
        if (isMounted) setIsLoadingCredits(false);
      }
    }
  }, []);

  const creditUsage = credits?.total
    ? Math.min(100, Math.round((credits.remaining / credits.total) * 100))
    : 0;
  const hydrateAvatarFromProfile = useCallback(async () => {
    if (isFetchingAvatar.current) return;
    isFetchingAvatar.current = true;
    try {
      const response = await fetch("/api/profile", { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      const imageFromApi = data?.imageUrl ?? data?.user?.image ?? null;
      if (imageFromApi) {
        setAvatarSrc(resolveAvatar(imageFromApi));
      }
    } catch {
      // ignore
    } finally {
      isFetchingAvatar.current = false;
    }
  }, [resolveAvatar]);

  useEffect(() => {
    setAvatarSrc(resolveAvatar(session?.user?.image ?? null));
  }, [session?.user?.image, resolveAvatar]);

  useEffect(() => {
    const handler = () => {
      hydrateAvatarFromProfile();
    };
    // Fetch once on mount for fresh avatar
    handler();
    window.addEventListener("profile:updated", handler);
    return () => window.removeEventListener("profile:updated", handler);
  }, [hydrateAvatarFromProfile]);

  return (
    <header className="rounded-xl border border-white/70 bg-gradient-to-r from-[#fbf8ff] via-[#f7f3ff] to-[#fbf9ff] p-4 shadow-[0_24px_55px_-34px_rgba(84,65,122,0.35)] backdrop-blur">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 w-full md:w-[30%]">
          <button
            type="button"
            onClick={onToggleNav}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#e6dff5] bg-white/90 text-[#8e86a9] shadow-[0_12px_32px_-22px_rgba(82,66,139,0.4)] transition hover:-translate-y-0.5 hover:border-primary-200 hover:text-primary-500 md:hidden"
            aria-label={isNavOpen ? "Close navigation" : "Open navigation"}
          >
            {isNavOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          <div className="relative flex-1 w-full">
            <div className="flex h-12 items-center gap-3 rounded-[18px] border border-[#e6dff5] bg-white/90 px-4 shadow-[0_15px_45px_-30px_rgba(82,66,139,0.42)] transition focus-within:border-[#ccb9ff] focus-within:shadow-[0_18px_45px_-24px_rgba(124,94,171,0.45)]">
              <Search className="h-5 w-5 text-[#8e86a9]" />
              <input
                type="search"
                placeholder="Search jobs or candidates..."
                className="w-full bg-transparent text-sm font-medium text-[#5c5177] placeholder:text-[#a8a0be] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 md:justify-end">
          <div className="hidden items-center gap-3 rounded-2xl border border-[#e6dff5] bg-white/90 px-4 py-2 text-[#5c5177] shadow-[0_16px_38px_-28px_rgba(82,66,139,0.36)] md:flex">
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#8e86a9]">
                Current Plan
              </span>
              <span className="text-base font-semibold text-[#5c5177]">
                {isLoadingCredits ? "…" : credits?.plan ?? "—"}
              </span>
            </div>
          </div>
          <div className="hidden items-center gap-3 rounded-2xl border border-[#e6dff5] bg-white/90 px-4 py-2 text-[#5c5177] shadow-[0_16px_38px_-28px_rgba(82,66,139,0.36)] md:flex">
            <div className="flex flex-col gap-1">
              <div className="flex flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoadingCredits(true);
                    fetch("/api/credits/balance")
                      .then(async (res) => {
                        if (!res.ok) throw new Error("Failed to load credits");
                        return res.json();
                      })
                      .then((data) =>
                        setCredits({
                          remaining: data.remaining,
                          total: data.total,
                          used: data.used,
                          plan: data.plan,
                        })
                      )
                      .catch((err) => {
                        console.error(err);
                        setCredits(null);
                      })
                      .finally(() => {
                        setIsLoadingCredits(false);
                        if (typeof window !== "undefined") {
                          window.dispatchEvent(new Event("company:refresh"));
                        }
                      });
                  }}
                  className="cursor-pointer inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-semibold text-[#3D64FF] shadow-sm transition hover:scale-[1.01]"
                  title="Refresh credits"
                >
                  <RefreshCw className="h-4 w-4 text-primary" />
                </button>
                <span className="text-sm font-medium text-base">
                  Remaining{" "}
                  <span className="font-semibold">
                    {isLoadingCredits
                      ? "…"
                      : credits?.remaining?.toLocaleString() ?? "—"}
                  </span>{" "}
                  /{" "}
                  <span className="font-semibold">
                    {isLoadingCredits
                      ? "…"
                      : credits?.total?.toLocaleString() ?? "—"}
                  </span>{" "}
                  carriX Credit
                </span>
                <Link
                  href="/credits"
                  className="inline-flex items-center rounded-[12px] bg-gradient-to-r from-primary-500 to-[#f06292] px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-[0_12px_28px_-20px_rgba(216,8,128,0.55)] transition hover:translate-y-[-1px]"
                >
                  Buy more
                </Link>
              </div>
              <div
                className={`h-2 w-full overflow-hidden rounded-full bg-[#f0e8f7] ${
                  isLoadingCredits ? "animate-pulse" : ""
                }`}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#7c5dfa] via-[#9c6cf8] to-[#f06292]"
                  style={{ width: `${creditUsage}%` }}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-[#e6dff5] bg-white/90 text-[#8e86a9] shadow-[0_12px_32px_-22px_rgba(82,66,139,0.4)] transition hover:-translate-y-0.5 hover:border-primary-200 hover:text-primary-500"
          >
            <Bell className="h-5 w-5" />
          </button>
          <Link href="/profile" className="cursor-pointer">
            <div className="relative h-11 w-11 overflow-hidden rounded-full border border-[#e6dff5] bg-white shadow-[0_12px_30px_-20px_rgba(82,66,139,0.4)]">
              <Image
                src={avatarSrc}
                alt="User avatar"
                fill
                sizes="44px"
                className="object-cover"
                unoptimized
                onError={() => setAvatarSrc(defaultAvatar)}
              />
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
