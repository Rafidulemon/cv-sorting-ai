"use client";

import type { ComponentType, ReactNode } from "react";

type MetricCardProps = {
  title: string;
  value: string;
  helper: string;
  icon: ComponentType<{ className?: string }>;
  accent?: "primary" | "emerald" | "amber" | "indigo";
  footer?: ReactNode;
};

export default function MetricCard({ title, value, helper, icon: Icon, accent = "primary", footer }: MetricCardProps) {
  const accentMap: Record<NonNullable<MetricCardProps["accent"]>, string> = {
    primary: "bg-primary-50 text-primary-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };
  return (
    <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-card-soft">
      <div className="flex items-start justify-between">
        <div className={`grid h-11 w-11 place-items-center rounded-2xl ${accentMap[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
        {footer}
      </div>
      <div className="mt-4 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8a90a6]">{title}</p>
        <p className="text-2xl font-semibold text-[#1f2a44]">{value}</p>
        <p className="text-xs text-[#6b7280]">{helper}</p>
      </div>
    </div>
  );
}
