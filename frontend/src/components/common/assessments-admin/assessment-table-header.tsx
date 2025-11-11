'use client';

import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

interface AssessmentTableHeaderProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: (checked: boolean) => void;
}

export default function AssessmentTableHeader({
  selectedCount,
  totalCount,
  onSelectAll,
}: AssessmentTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow className="bg-indigo-600">
        <TableHead className="w-12 text-white">
          <Checkbox
            checked={totalCount > 0 && selectedCount === totalCount}
            onCheckedChange={onSelectAll}
            aria-label="Select all visible assessments"
          />
        </TableHead>
        <TableHead className="text-white">Applicant</TableHead>
        <TableHead className="text-white">Track</TableHead>
        <TableHead className="text-white">Cohort</TableHead>
        <TableHead className="text-white">Submitted</TableHead>
        <TableHead className="text-white">Status</TableHead>
        <TableHead className="text-right text-white">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}
