"use client";

import { cn } from "@/utils/cn";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (newPage: number) => void;
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages === 1) return null;

  const siblings = 1;
  const left = Math.max(1, page - siblings);
  const right = Math.min(totalPages, page + siblings);

  const pages: (number | string)[] = [];
  if (left > 1) pages.push(1, ...(left > 2 ? ["..."] : []));
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < totalPages)
    pages.push(...(right < totalPages - 1 ? ["..."] : []), totalPages);

  const buttonClass =
    "px-2 sm:px-3 py-1 sm:py-2 rounded-md border transition-colors border-[hsl(var(--border))] text-sm sm:text-base";
  const activeClass =
    "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))]";
  const inactiveClass =
    "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]";
  const disabledClass =
    "opacity-50 pointer-events-none text-[hsl(var(--muted-foreground))]";

  return (
    <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Page Info - Top on mobile, left on desktop */}
      <div className="text-sm text-[hsl(var(--muted-foreground))] order-2 sm:order-1">
        Page {page} of {totalPages} — {total} items
      </div>

      {/* Pagination Controls - Top on mobile, right on desktop */}
      <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={cn(
            buttonClass,
            "min-w-[60px] sm:min-w-[70px]",
            page === 1 ? disabledClass : inactiveClass
          )}
        >
          <span className="sm:hidden">←</span>
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Hide page numbers on very small screens */}
        <div className="hidden xs:flex items-center gap-1 sm:gap-2">
          {pages.map((p, i) =>
            typeof p === "string" ? (
              <span
                key={i}
                className="px-1 sm:px-2 text-[hsl(var(--muted-foreground))] text-sm"
              >
                {p}
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={cn(
                  buttonClass,
                  "min-w-[32px] sm:min-w-[40px]",
                  p === page ? activeClass : inactiveClass
                )}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={cn(
            buttonClass,
            "min-w-[60px] sm:min-w-[70px]",
            page === totalPages ? disabledClass : inactiveClass
          )}
        >
          <span className="sm:hidden">→</span>
          <span className="hidden sm:inline">Next</span>
        </button>
      </div>
    </div>
  );
}
