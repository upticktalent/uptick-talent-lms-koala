'use client';

import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

interface InterviewsTableHeaderProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: (checked: boolean) => void;
}

export default function InterviewsTableHeader({
  selectedCount,
  totalCount,
  onSelectAll,
}: InterviewsTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow className="bg-indigo-600">
        <TableHead className="w-12 text-white">
          <Checkbox
            checked={totalCount > 0 && selectedCount === totalCount}
            onCheckedChange={onSelectAll}
            aria-label="Select all visible interviews"
          />
        </TableHead>
        <TableHead className="text-white">Applicant</TableHead>
        <TableHead className="text-white">Track</TableHead>
        <TableHead className="text-white">Interviewer</TableHead>
        <TableHead className="text-white">Date</TableHead>
        <TableHead className="text-white">Status</TableHead>
        <TableHead className="text-right text-white">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}
