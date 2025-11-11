'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Eye, Loader } from 'lucide-react';
import { Applicant } from '@/types/assessments-admin';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Box from '@/components/ui/box';

// Safe access helper functions
const getApplicantName = (app: Applicant) => {
  if (!app.applicant) return 'Unknown Applicant';
  return (
    `${app.applicant.firstName || ''} ${app.applicant.lastName || ''}`.trim() || 'Unknown Applicant'
  );
};

const getApplicantEmail = (app: Applicant) => {
  return app.applicant?.email || 'No email';
};

const getTrackName = (app: Applicant) => {
  return app.track?.name || 'Unknown Track';
};

const getCohortName = (app: Applicant) => {
  return app.cohort?.name || 'Unknown Cohort';
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'rejected':
      return <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>;
    case 'shortlisted':
      return <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">Shortlisted</Badge>;
    default:
      return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>;
  }
};

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Invalid Date';
  }
};

interface ApplicationsTableMobileProps {
  applicants: Applicant[];
  selectedApplicants: string[];
  onSelectApplicant: (id: string, checked: boolean) => void;
  onViewApplicant: (applicant: Applicant) => void;
  onUpdateApplicant: (id: string, status: string) => void;
  loadingIds?: Set<string>;
}

export default function ApplicationsMobile({
  applicants,
  selectedApplicants,
  onSelectApplicant,
  onViewApplicant,
  onUpdateApplicant,
  loadingIds = new Set(),
}: ApplicationsTableMobileProps) {
  const isApplicantLoading = (id: string) => loadingIds.has(id);

  if (applicants.length === 0) {
    return <Box className="text-center py-8 text-gray-500">No applicants found.</Box>;
  }

  return (
    <Box className="sm:hidden space-y-3">
      {applicants.map(applicant => (
        <Box
          key={applicant._id}
          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
        >
          <Box className="flex items-start justify-between gap-3">
            <Box className="flex-1">
              <Box className="flex items-center justify-between">
                <Box>
                  <Box className="font-medium text-gray-900 capitalize">
                    {getApplicantName(applicant)}
                  </Box>
                  <Box className="text-xs text-gray-500">{getApplicantEmail(applicant)}</Box>
                </Box>
              </Box>

              <Box className="mt-2 flex flex-wrap items-center gap-2">
                <Box className="text-sm text-gray-700">{getTrackName(applicant)}</Box>
                <Badge variant="outline" className="font-normal text-gray-900">
                  {getCohortName(applicant)}
                </Badge>
                {getStatusBadge(applicant.status)}
              </Box>

              <Box className="mt-2 text-xs text-gray-600">
                Applied: {formatDate(applicant.submittedAt)}
              </Box>
            </Box>
          </Box>

          <Box className="mt-3 flex gap-2 flex-wrap">
            {/* Updated View Button with better styling to match desktop */}
            <Button
              size="sm"
              onClick={() => onViewApplicant(applicant)}
              className="flex-1 flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 cursor-pointer transition-colors duration-200 font-medium"
              aria-label={`View details for ${getApplicantName(applicant)}`}
            >
              <Eye className="w-4 h-4" />
              View
            </Button>

            <Select
              value={applicant.status}
              onValueChange={value => onUpdateApplicant(applicant._id, value)}
              disabled={isApplicantLoading(applicant._id)}
            >
              <SelectTrigger className="flex-1 border-indigo-200 text-black focus:ring-indigo-600 disabled:opacity-50">
                {isApplicantLoading(applicant._id) ? (
                  <Box className="flex items-center gap-2 justify-center">
                    <Loader className="w-3 h-3 animate-spin" />
                    <span className="text-xs">Updating...</span>
                  </Box>
                ) : (
                  <SelectValue placeholder="Update status" />
                )}
              </SelectTrigger>
              <SelectContent className="bg-white border border-indigo-100 text-black">
                <SelectItem className="focus:bg-indigo-600" value="pending">
                  Pending
                </SelectItem>
                <SelectItem className="focus:bg-indigo-600" value="shortlisted">
                  Shortlist
                </SelectItem>
                <SelectItem className="focus:bg-indigo-600" value="rejected">
                  Reject
                </SelectItem>
              </SelectContent>
            </Select>

            <Box className="w-full flex items-center gap-2 mt-2">
              <Checkbox
                checked={selectedApplicants.includes(applicant._id)}
                onCheckedChange={checked => onSelectApplicant(applicant._id, checked as boolean)}
                aria-label={`Select ${getApplicantName(applicant)}`}
              />
              <Box className="text-sm text-gray-600">Select for bulk action</Box>
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
