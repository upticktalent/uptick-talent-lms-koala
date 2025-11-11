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
import { Eye, Download } from 'lucide-react';
import Box from '@/components/ui/box';
import { Assessment } from '@/types/assessments-admin';
import {
  getApplicantName,
  getApplicantEmail,
  getTrackName,
  getCohortName,
  formatDate,
  getStatusBadgeVariant,
} from './assessment-utils';

interface AssessmentTableRowProps {
  assessment: Assessment;
  isSelected: boolean;
  isLoading: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onView: (assessment: Assessment) => void;
  onDownload: (assessment: Assessment) => void;
  onStatusChange: (id: string, status: Assessment['status'], assessment: Assessment) => void;
}

export default function AssessmentTableRow({
  assessment,
  isSelected,
  isLoading,
  onSelect,
  onView,
  onDownload,
  onStatusChange,
}: AssessmentTableRowProps) {
  const statusBadge = getStatusBadgeVariant(assessment.status);

  return (
    <TableRow key={assessment._id} className="hover:bg-indigo-50/50">
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={checked => onSelect(assessment._id, checked as boolean)}
          aria-label={`Select ${getApplicantName(assessment)}`}
        />
      </TableCell>
      <TableCell>
        <Box>
          <Box className="font-medium text-gray-900 capitalize">{getApplicantName(assessment)}</Box>
          <Box className="text-xs text-gray-500">{getApplicantEmail(assessment)}</Box>
        </Box>
      </TableCell>
      <TableCell className="text-gray-700">{getTrackName(assessment)}</TableCell>
      <TableCell>
        <Badge variant="outline" className="font-normal text-gray-900">
          {getCohortName(assessment)}
        </Badge>
      </TableCell>
      <TableCell className="text-gray-600">{formatDate(assessment.submittedAt)}</TableCell>
      <TableCell>
        <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
      </TableCell>
      <TableCell className="text-right">
        <Box className="flex gap-2 justify-end flex-wrap items-center">
          {/* View Button */}
          <Button
            size="sm"
            onClick={() => onView(assessment)}
            className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 cursor-pointer transition-colors duration-200"
            aria-label={`View details for ${getApplicantName(assessment)}`}
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">View</span>
          </Button>

          {/* Download Button */}
          <Button
            size="sm"
            onClick={() => onDownload(assessment)}
            className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 cursor-pointer transition-colors duration-200"
          >
            <Download className="w-4 h-4" />
          </Button>

          {/* Status Update Select */}
          <Select
            value={assessment.status}
            onValueChange={(value: 'submitted' | 'under-review' | 'reviewed') =>
              onStatusChange(assessment._id, value, assessment)
            }
            disabled={isLoading}
          >
            <SelectTrigger className="w-[140px] border-indigo-200 text-black focus:ring-indigo-600 disabled:opacity-50">
              <SelectValue placeholder="Update status" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-indigo-100 text-black">
              <SelectItem value="under-review" className="focus:bg-indigo-600">
                Under Review
              </SelectItem>
              <SelectItem value="reviewed" className="focus:bg-indigo-600">
                Review
              </SelectItem>
            </SelectContent>
          </Select>
        </Box>
      </TableCell>
    </TableRow>
  );
}
