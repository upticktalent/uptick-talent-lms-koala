'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Box from '@/components/ui/box';

interface InterviewsPaginationProps {
  currentPage: number;
  totalPages: number;
  startItem: number;
  endItem: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export default function InterviewsPagination({
  currentPage,
  totalPages,
  startItem,
  endItem,
  totalItems,
  onPageChange,
}: InterviewsPaginationProps) {
  return (
    <Box className="flex flex-col sm:flex-row justify-between items-center gap-3">
      <Box className="flex gap-2">
        <Button
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="text-indigo-600 border border-indigo-600 cursor-pointer disabled:cursor-not-allowed bg-transparent"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Prev
        </Button>
        <Button
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="text-indigo-600 border border-indigo-600 cursor-pointer disabled:cursor-not-allowed bg-transparent"
        >
          Next <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </Box>

      <Box className="flex flex-col sm:flex-row items-center gap-2 text-sm text-gray-600">
        <p>
          Showing {startItem}-{endItem} of {totalItems} interviews
        </p>
        <span className="hidden sm:inline">•</span>
        <p>
          Page {currentPage} of {totalPages}
        </p>
      </Box>
    </Box>
  );
}
