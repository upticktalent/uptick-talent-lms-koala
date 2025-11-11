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
import { Eye, Loader } from 'lucide-react';
import Box from '@/components/ui/box';
import { Applicant } from '@/types/assessments-admin';
import {
  getApplicantName,
  getApplicantEmail,
  getTrackName,
  getCohortName,
  formatDate,
  getStatusBadgeVariant,
} from './applications-utils';

interface ApplicationsTableRowProps {
  applicant: Applicant;
  isSelected: boolean;
  isLoading: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onView: (applicant: Applicant) => void;
  onStatusChange: (id: string, status: Applicant['status'], applicant: Applicant) => void;
}

export default function ApplicationsTableRow({
  applicant,
  isSelected,
  isLoading,
  onSelect,
  onView,
  onStatusChange,
}: ApplicationsTableRowProps) {
  const statusBadge = getStatusBadgeVariant(applicant.status);

  return (
    <TableRow key={applicant._id} className="hover:bg-indigo-50/50">
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={checked => onSelect(applicant._id, checked as boolean)}
          aria-label={`Select ${getApplicantName(applicant)}`}
        />
      </TableCell>
      <TableCell>
        <Box>
          <Box className="font-medium text-gray-900 capitalize">{getApplicantName(applicant)}</Box>
          <Box className="text-xs text-gray-500">{getApplicantEmail(applicant)}</Box>
        </Box>
      </TableCell>
      <TableCell className="text-gray-700">{getTrackName(applicant)}</TableCell>
      <TableCell>
        <Badge variant="outline" className="font-normal text-gray-900">
          {getCohortName(applicant)}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
      </TableCell>
      <TableCell className="text-gray-600">{formatDate(applicant.submittedAt)}</TableCell>
      <TableCell className="text-right">
        <Box className="flex gap-2 justify-end flex-wrap items-center">
          <Button
            size="sm"
            onClick={() => onView(applicant)}
            className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 cursor-pointer transition-colors duration-200"
            aria-label={`View details for ${getApplicantName(applicant)}`}
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">View</span>
          </Button>

          <Select
            value={applicant.status}
            onValueChange={(value: 'pending' | 'shortlisted' | 'rejected') =>
              onStatusChange(applicant._id, value, applicant)
            }
            disabled={isLoading}
          >
            <SelectTrigger className="w-[140px] border-indigo-200 text-black focus:ring-indigo-600 disabled:opacity-50">
              {isLoading ? (
                <Box className="flex items-center gap-2">
                  <Loader className="w-3 h-3 animate-spin" />
                  <span className="text-sm">Updating...</span>
                </Box>
              ) : (
                <SelectValue placeholder="Update status" />
              )}
            </SelectTrigger>
            <SelectContent className="bg-white border border-indigo-100 text-black">
              <SelectItem value="pending" className="focus:bg-indigo-600">
                Pending
              </SelectItem>
              <SelectItem value="shortlisted" className="focus:bg-indigo-600">
                Shortlist
              </SelectItem>
              <SelectItem value="rejected" className="focus:bg-indigo-600">
                Reject
              </SelectItem>
            </SelectContent>
          </Select>
        </Box>
      </TableCell>
    </TableRow>
  );
}
