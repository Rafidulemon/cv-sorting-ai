'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationProps = {
  page: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (nextPage: number) => void;
  variant?: 'light' | 'dark';
};

type PageToken = number | 'ellipsis';

const brandGradient = 'bg-gradient-to-r from-[#3D64FF] via-[#4F7BFF] to-[#3D64FF]';

export function Pagination({ page, totalItems, pageSize = 5, onPageChange, variant = 'light' }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(totalItems, safePage * pageSize);

  const goToPage = (next: number) => {
    const clamped = Math.min(Math.max(next, 1), totalPages);
    if (clamped !== safePage) {
      onPageChange(clamped);
    }
  };

  const getPageTokens = (): PageToken[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const tokens: PageToken[] = [1];
    const showLeftEllipsis = safePage > 4;
    const showRightEllipsis = safePage < totalPages - 3;

    if (showLeftEllipsis) tokens.push('ellipsis');

    const startPage = Math.max(2, safePage - 1);
    const endPage = Math.min(totalPages - 1, safePage + 1);
    for (let i = startPage; i <= endPage; i += 1) {
      tokens.push(i);
    }

    if (showRightEllipsis) tokens.push('ellipsis');
    tokens.push(totalPages);

    return tokens;
  };

  const tokens = getPageTokens();

  const containerClass =
    variant === 'dark'
      ? 'border-slate-800 bg-slate-900/80 text-slate-200'
      : 'border-[#E5E7EB] bg-[#FFFFFF] text-[#1F2A44]';
  const pillsClass =
    variant === 'dark'
      ? 'border-slate-800 bg-slate-900/70'
      : 'border-[#E5E7EB] bg-[#EEF2F7]';
  const prevNextDisabled = variant === 'dark' ? 'text-slate-500' : 'text-[#9CA3AF]';
  const inactivePage = variant === 'dark' ? 'text-slate-300 hover:text-primary-200' : 'text-[#4B5563] hover:text-[#3D64FF]';

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm ${containerClass}`}>
      <span className={`text-xs ${variant === 'dark' ? 'text-slate-400' : 'text-[#6B7280]'}`}>
        Showing {start}-{end} of {totalItems}
      </span>
      <div className={`flex items-center gap-3 rounded-full border px-2 py-1 ${pillsClass}`}>
        <button
          type="button"
          onClick={() => goToPage(safePage - 1)}
          disabled={safePage === 1}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition ${
            safePage === 1
              ? `cursor-not-allowed ${prevNextDisabled}`
              : `${brandGradient} text-white shadow-[0_8px_24px_rgba(61,100,255,0.35)] hover:opacity-90`
          }`}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-1 px-1">
          {tokens.map((token, index) =>
            token === 'ellipsis' ? (
              <span key={`ellipsis-${index.toString()}`} className="px-2 text-sm font-semibold text-[#9CA3AF]">
                ...
              </span>
            ) : (
              <button
                key={token}
                type="button"
                onClick={() => goToPage(token)}
                className={`h-10 w-10 rounded-2xl text-sm font-semibold transition ${
                  token === safePage
                    ? `${brandGradient} text-white shadow-[0_8px_24px_rgba(61,100,255,0.35)]`
                    : inactivePage
                }`}
              >
                {token}
              </button>
            ),
          )}
        </div>
        <button
          type="button"
          onClick={() => goToPage(safePage + 1)}
          disabled={safePage === totalPages}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition ${
            safePage === totalPages
              ? `cursor-not-allowed ${prevNextDisabled}`
              : `${brandGradient} text-white shadow-[0_8px_24px_rgba(61,100,255,0.35)] hover:opacity-90`
          }`}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
