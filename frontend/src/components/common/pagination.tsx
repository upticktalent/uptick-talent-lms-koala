'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={page === 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          className="text-indigo-600 border border-indigo-600 cursor-pointer disabled:cursor-not-allowed bg-transparent"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Prev
        </Button>
        <Button
          size="sm"
          disabled={page === totalPages}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          className="text-indigo-600 border border-indigo-600 cursor-pointer disabled:cursor-not-allowed bg-transparent"
        >
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <p className="text-sm text-gray-600">
        Page {page} of {totalPages}
      </p>
    </div>
  );
}
