'use client';

import { TableRow, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye } from 'lucide-react';
import Box from '@/components/ui/box';
import { Interview } from './interviews-types';
import { getStatusBadgeVariant } from './interviews-utils';

interface InterviewsTableRowProps {
  interview: Interview;
  isSelected: boolean;
  isLoading: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onView: (interview: Interview) => void;
  onStatusChange: (id: string, status: Interview['status']) => void;
}

export default function InterviewsTableRow({
  interview,
  isSelected,
  isLoading,
  onSelect,
  onView,
  onStatusChange,
}: InterviewsTableRowProps) {
  const statusBadge = getStatusBadgeVariant(interview.status);

  return (
    <TableRow key={interview.id} className="hover:bg-indigo-50/50">
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={checked => onSelect(interview.id, checked as boolean)}
          aria-label={`Select ${interview.applicant.name}`}
        />
      </TableCell>
      <TableCell>
        <Box>
          <Box className="font-medium text-gray-900">{interview.applicant.name}</Box>
          <Box className="text-xs text-gray-500">{interview.applicant.email}</Box>
        </Box>
      </TableCell>
      <TableCell className="text-gray-700">{interview.track}</TableCell>
      <TableCell>
        <Box>
          <Box className="font-medium text-gray-900">{interview.interviewer.name}</Box>
          <Box className="text-xs text-gray-500">{interview.interviewer.email}</Box>
        </Box>
      </TableCell>
      <TableCell>
        <Box className="text-gray-600">
          <Box className="font-medium">{interview.date}</Box>
          <Box className="text-xs">{interview.time}</Box>
        </Box>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={`text-xs font-medium ${statusBadge.className}`}>
          {statusBadge.label}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <Box className="flex gap-2 justify-end">
          <Button
            size="sm"
            onClick={() => onView(interview)}
            className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            View
          </Button>

          <Select
            value={interview.status}
            onValueChange={(value: Interview['status']) => onStatusChange(interview.id, value)}
            disabled={isLoading}
          >
            <SelectTrigger className="w-[140px] border-indigo-200 text-black focus:ring-indigo-600 disabled:opacity-50">
              <SelectValue placeholder="Update status" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-indigo-100 text-black">
              <SelectItem value="scheduled" className="focus:bg-indigo-600">
                Scheduled
              </SelectItem>
              <SelectItem value="completed" className="focus:bg-indigo-600">
                Completed
              </SelectItem>
              <SelectItem value="cancelled" className="focus:bg-indigo-600">
                Cancelled
              </SelectItem>
            </SelectContent>
          </Select>
        </Box>
      </TableCell>
    </TableRow>
  );
}
