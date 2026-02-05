"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Filter,
  Loader2,
  Search,
  Trash2,
  Users2,
  FileText,
  XCircle,
} from "lucide-react";
import { Pagination } from "@/app/components/Pagination";

export type CandidateRow = {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  headline: string | null;
  source: string | null;
  createdAt: string;
  tags: string[];
  jobId: string | null;
  jobTitle: string | null;
  resumePublicUrl: string | null;
  resumeStatus: string | null;
  uploadedBy: string | null;
};

const STATUS_OPTIONS = [
  "UPLOADED",
  "PARSING",
  "EMBEDDING",
  "SCORING",
  "COMPLETED",
  "FAILED",
];

const formatStatusLabel = (value: string) =>
  value === "all"
    ? "All statuses"
    : value
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function CandidatesPage() {
  const [rows, setRows] = useState<CandidateRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const sources = useMemo(() => {
    const unique = new Set<string>();
    rows.forEach((row) => {
      if (row.source) unique.add(row.source);
    });
    return ["all", ...Array.from(unique)];
  }, [rows]);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("pageSize", String(pageSize));
        if (searchTerm.trim()) params.set("q", searchTerm.trim());
        if (sourceFilter !== "all") params.set("source", sourceFilter);
        if (statusFilter !== "all") params.set("status", statusFilter);
        const res = await fetch(`/api/candidates?${params.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const payload = await res.json();
        if (!res.ok)
          throw new Error(payload?.error || "Failed to load candidates");
        setRows(Array.isArray(payload?.candidates) ? payload.candidates : []);
        setTotal(typeof payload?.total === "number" ? payload.total : 0);
        setPage(typeof payload?.page === "number" ? payload.page : 1);
        setPageSize(
          typeof payload?.pageSize === "number" ? payload.pageSize : 10,
        );
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [page, pageSize, searchTerm, sourceFilter, statusFilter]);

  const exportCsv = () => {
    if (!rows.length) return;
    const header = [
      "Name",
      "Email",
      "Phone",
      "Location",
      "Source",
      "Tags",
      "Added",
    ];
    const csv = [
      header,
      ...rows.map((row) => [
        row.fullName || "Unknown",
        row.email || "",
        row.phone || "",
        row.location || "",
        row.source || "—",
        row.tags?.join("; ") || "",
        formatDate(row.createdAt),
      ]),
    ]
      .map((line) =>
        line.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "candidates.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const clearFilters = () => {
    setSearchTerm("");
    setSourceFilter("all");
    setStatusFilter("all");
    setPage(1);
  };

  return (
    <div className="space-y-8 text-[#181B31]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8A94A6] transition hover:text-[#3D64FF]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold leading-tight">Candidates</h1>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#E5EAFE] px-3 py-1 text-xs font-semibold text-[#3D64FF]">
              <Users2 className="h-4 w-4" />
              {total} total
            </span>
          </div>
          <p className="text-sm text-[#4B5563]">
            Search, filter, and export your candidate pool.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-2">
            <Search className="h-4 w-4 text-[#9CA3AF]" />
            <input
              value={searchTerm}
              onChange={(e) => {
                setPage(1);
                setSearchTerm(e.target.value);
              }}
              placeholder="Search name, email, location, tag"
              className="w-64 bg-transparent text-sm outline-none placeholder:text-[#9CA3AF]"
            />
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-2 text-sm">
            <Filter className="h-4 w-4 text-[#9CA3AF]" />
            <select
              value={sourceFilter}
              onChange={(e) => {
                setPage(1);
                setSourceFilter(e.target.value);
              }}
              className="bg-transparent text-sm outline-none"
            >
              {sources.map((source) => (
                <option key={source} value={source}>
                  {source === "all" ? "All sources" : source || "Unknown"}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-2 text-sm">
            <Filter className="h-4 w-4 text-[#9CA3AF]" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setPage(1);
                setStatusFilter(e.target.value);
              }}
              className="bg-transparent text-sm outline-none"
            >
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {formatStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#374151] transition hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
          >
            <XCircle className="h-4 w-4 text-[#9CA3AF]" />
            Clear
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-full border border-[#3D64FF]/40 bg-[#3D64FF]/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#3D64FF] transition hover:border-[#3D64FF]/70 hover:bg-[#3D64FF]/20"
            disabled={!rows.length}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-[#E5E7EB] bg-white shadow-card-soft">
        <div className="min-w-[1080px] grid grid-cols-[0.45fr_1.8fr_1fr_1.2fr_1fr_1fr] items-center gap-1 border-b border-[#EEF2F7] bg-[#F9FAFB] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8A94A6]">
          <span>ID</span>
          <span>Name</span>
          <span>Job</span>
          <span>Uploaded by</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        <div className="min-w-[1080px]">
          {loading ? (
            <div className="flex items-center gap-2 px-4 py-6 text-sm text-[#4B5563]">
              <Loader2 className="h-4 w-4 animate-spin text-[#3D64FF]" />
              Loading candidates...
            </div>
          ) : error ? (
            <div className="px-4 py-6 text-sm text-[#B91C1C]">{error}</div>
          ) : rows.length === 0 ? (
            <div className="px-4 py-6 text-sm text-[#6B7280]">
              No candidates found.
            </div>
          ) : (
            rows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-[0.45fr_1.8fr_1fr_1.2fr_1fr_1fr] items-center gap-2 px-6 py-4 text-sm text-[#1F2A44] hover:bg-[#F8FAFC]"
              >
                <p className="text-xs text-[#6B7280]">{row.id.slice(0, 6)}</p>
                <div className="space-y-1">
                  <p className="font-semibold">{row.fullName || "Unknown"}</p>
                </div>
                <div className="space-y-1 text-sm text-[#374151]">
                  <p>{row.jobTitle || "—"}</p>
                  {row.jobId && (
                    <Link
                      href={`/jobs/${row.jobId}`}
                      className="text-xs text-[#3D64FF] underline"
                    >
                      View job
                    </Link>
                  )}
                </div>
                <p className="text-sm text-[#374151]">
                  {row.uploadedBy || "—"}
                </p>
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#F5F7FB] px-3 py-1 text-xs font-semibold text-[#3D64FF]">
                  {row.resumeStatus || "—"}
                </span>
                <div className="flex items-center gap-1">
                  {row.resumePublicUrl ? (
                    <Link
                      href={row.resumePublicUrl}
                      target="_blank"
                      className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs font-semibold text-[#1F2A44] transition hover:border-[#3D64FF]/40 hover:text-[#3D64FF]"
                    >
                      <FileText className="h-4 w-4" />
                      View
                    </Link>
                  ) : (
                    <span className="text-xs text-[#9CA3AF]">No resume</span>
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      const confirmed = window.confirm(
                        "Delete this candidate and associated resumes?",
                      );
                      if (!confirmed) return;
                      try {
                        const res = await fetch(`/api/candidates/${row.id}`, {
                          method: "DELETE",
                        });
                        if (!res.ok) {
                          const body = await res.json().catch(() => ({}));
                          throw new Error(body?.error || "Delete failed");
                        }
                        setRows((prev) =>
                          prev.filter((item) => item.id !== row.id),
                        );
                        setTotal((prev) => Math.max(0, prev - 1));
                      } catch (err) {
                        alert((err as Error).message);
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-[#FEE2E2] bg-[#FFF5F5] px-3 py-1 text-xs font-semibold text-[#B91C1C] transition hover:border-[#FCA5A5] hover:bg-[#FEE2E2]"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex items-end justify-end gap-3">
        <Pagination
          page={page}
          totalItems={total}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
