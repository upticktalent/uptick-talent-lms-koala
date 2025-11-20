"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface CustomPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (newPage: number) => void;
}

export function CustomPagination({
  page,
  pageSize,
  total,
  onPageChange,
}: CustomPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages === 1) return null;

  const siblings = 1;
  const left = Math.max(1, page - siblings);
  const right = Math.min(totalPages, page + siblings);

  const showLeftEllipsis = left > 2;
  const showRightEllipsis = right < totalPages - 1;

  const pages = [];
  for (let i = left; i <= right; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
      <div className="text-sm text-muted-foreground order-2 sm:order-1">
        Page {page} of {totalPages} — {total} items
      </div>

      <div className="order-1 sm:order-2">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(page - 1);
                }}
                disabled={page === 1}
                className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>

            {/* First Page */}
            {left > 1 && (
              <PaginationItem>
                <PaginationLink 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(1);
                  }}
                  className="cursor-pointer"
                >
                  1
                </PaginationLink>
              </PaginationItem>
            )}

            {/* Left Ellipsis */}
            {showLeftEllipsis && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Page Numbers */}
            {pages.map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  isActive={p === page}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(p);
                  }}
                  className="cursor-pointer"
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}

            {/* Right Ellipsis */}
            {showRightEllipsis && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Last Page */}
            {right < totalPages && (
              <PaginationItem>
                <PaginationLink 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(totalPages);
                  }}
                  className="cursor-pointer"
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(page + 1);
                }}
                disabled={page === totalPages}
                className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
