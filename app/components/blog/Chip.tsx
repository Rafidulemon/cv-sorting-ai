import React from "react";

type ChipProps = {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
};

export default function Chip({ active, children, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-full px-4 py-2 text-sm font-semibold transition ring-1",
        active
          ? "bg-primary-500 text-white ring-primary-400 shadow-[0_12px_30px_rgba(216,8,128,0.25)]"
          : "bg-white text-zinc-700 ring-zinc-200 hover:bg-primary-50 hover:text-primary-700 hover:ring-primary-200",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
