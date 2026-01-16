"use client";

import { createPortal } from "react-dom";
import { useMemo } from "react";

type BillingEntry = {
  id: string;
  credits: number;
  type: string;
  description: string | null;
  referenceId: string | null;
  referenceType: string | null;
  createdAt: string;
  estimatedBdt: number | null;
};

type InvoiceModalProps = {
  entry: BillingEntry;
  topUpRate: number | null;
  onClose: () => void;
  onDownload: (entry: BillingEntry) => void;
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

const formatCurrency = (value: number | null | undefined) =>
  typeof value === "number" ? `BDT ${value.toLocaleString()}` : "—";

export function InvoiceModal({ entry, topUpRate, onClose, onDownload }: InvoiceModalProps) {
  const rate = useMemo(() => (topUpRate !== null ? (topUpRate / 100).toFixed(2) : null), [topUpRate]);
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8A94A6]">Invoice</p>
            <h3 className="text-lg font-semibold text-[#181B31]">{entry.referenceId || entry.id}</h3>
            <p className="text-sm text-[#4B5563]">{formatDate(entry.createdAt)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#DCE0E0] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#3D64FF] hover:bg-[#3D64FF]/10"
          >
            Close
          </button>
        </div>

        <div className="mt-4 space-y-2 text-sm text-[#181B31]">
          <p className="font-semibold">
            {entry.type === "PURCHASE"
              ? "Top-up"
              : entry.type === "ALLOTMENT"
                ? "Plan credit"
                : entry.type}
          </p>
          <p className="text-[#4B5563]">{entry.description ?? "No description provided."}</p>
          <div className="rounded-2xl border border-[#E7E9F0] bg-[#F8F9FE] p-4">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>{entry.credits.toLocaleString()} credits</span>
              <span>{formatCurrency(entry.estimatedBdt)}</span>
            </div>
            {rate ? <p className="mt-1 text-xs text-[#6b7280]">Rate: BDT {rate} per credit</p> : null}
          </div>

          <div className="mt-4 grid gap-3 rounded-2xl border border-[#E7E9F0] bg-white p-4">
            <div className="flex items-center justify-between text-sm font-semibold text-[#181B31]">
              <span>Billing account</span>
              <span>carriX Labs Ltd.</span>
            </div>
            <div className="grid gap-1 text-xs text-[#4B5563] md:grid-cols-2">
              <span><strong className="text-[#181B31]">Bank:</strong> Dhaka Trust Bank, Gulshan Branch</span>
              <span><strong className="text-[#181B31]">Account #:</strong> 001234567890 (BDT)</span>
              <span><strong className="text-[#181B31]">Routing:</strong> 123456789</span>
              <span><strong className="text-[#181B31]">SWIFT:</strong> DHTRBDDH</span>
              <span><strong className="text-[#181B31]">Reference:</strong> {entry.referenceId || entry.id}</span>
              <span><strong className="text-[#181B31]">Billing email:</strong> billing@carrix.ai</span>
            </div>
            <p className="text-xs text-[#6b7280]">
              Please include the reference in your payment memo. Invoice will be marked paid automatically once funds clear.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => onDownload(entry)}
            className="inline-flex items-center justify-center rounded-full border border-[#3D64FF]/60 bg-[#3D64FF]/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#3D64FF] shadow-glow-primary hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/15"
          >
            Download
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
