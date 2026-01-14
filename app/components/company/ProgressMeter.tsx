"use client";

type ProgressMeterProps = {
  value: number;
  limit: number;
  label: string;
};

export default function ProgressMeter({ value, limit, label }: ProgressMeterProps) {
  const safeLimit = Number.isFinite(limit) ? limit : 0;
  const percent = safeLimit > 0 ? Math.min(100, Math.round((value / safeLimit) * 100)) : 0;
  const limitLabel = safeLimit > 0 ? safeLimit : "—";
  const percentLabel = safeLimit > 0 ? `${percent}%` : "—";
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-[#4b5563]">
        <span>{label}</span>
        <span>
          {value} / {limitLabel} · {percentLabel}
        </span>
      </div>
      <div className="h-2 rounded-full bg-[#EEF2F7]">
        <div className="h-2 rounded-full bg-gradient-to-r from-[#3D64FF] to-[#7b6dff]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
