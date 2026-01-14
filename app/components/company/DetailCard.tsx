"use client";

import type { ComponentType } from "react";
import type { CompanyDetailItem } from "@/app/types/company";

const displayValue = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed?.length ? trimmed : "Not set";
};

type DetailCardProps = {
  title: string;
  helper: string;
  icon: ComponentType<{ className?: string }>;
  items: CompanyDetailItem[];
};

export default function DetailCard({ title, helper, icon: Icon, items }: DetailCardProps) {
  return (
    <div className="space-y-4 rounded-3xl border border-white/70 bg-white/80 p-6 shadow-card-soft">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-50 text-primary-600">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-[#1f2a44]">{title}</p>
          <p className="text-xs text-[#6b7280]">{helper}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const hasValue = Boolean(item.value && item.value.trim().length);
          return (
            <div
              key={item.label}
              className={`rounded-2xl border border-white/70 bg-white px-4 py-3 shadow-card-soft ${item.span ? "sm:col-span-2" : ""}`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a90a6]">{item.label}</p>
              {item.isLink && hasValue ? (
                <a
                  href={item.value}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-primary-700 underline-offset-4 hover:underline"
                >
                  {item.value}
                </a>
              ) : (
                <p className="mt-1 text-sm text-[#1f2a44]">{displayValue(item.value)}</p>
              )}
              {item.helper ? <p className="text-xs text-[#6b7280]">{item.helper}</p> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
