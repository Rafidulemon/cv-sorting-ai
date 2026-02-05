"use client";

import type { CompanyBarData } from "@/app/types/company";

export default function MiniBarChart({ data, accent = "#3D64FF" }: { data: CompanyBarData[]; accent?: string }) {
  if (!data.length) {
    return <p className="text-sm text-[#6b7280]">No activity yet.</p>;
  }

  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="w-16 text-xs font-semibold text-[#6b7280]">{item.label}</span>
          <div className="relative h-2 flex-1 rounded-full bg-[#EEF2F7]">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(item.value / max) * 100}%`, backgroundColor: accent }}
            />
          </div>
          <span className="w-14 text-right text-xs font-semibold text-[#1f2a44]">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
