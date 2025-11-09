'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Eye, Download } from 'lucide-react';
import { Assessment } from '@/types/assessments-admin';
import { getFullName } from '@/utils/helper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Box from '@/components/ui/box';

// Helper functions
const getApplicantName = (assessment: Assessment) => {
  return (
    getFullName(
      assessment.application.applicant?.firstName,
      assessment.application.applicant?.lastName,
    ) || 'Unknown Applicant'
  );
};

const getApplicantEmail = (assessment: Assessment) => {
  return assessment.application.applicant?.email || 'No email';
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'rejected':
      return <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>;
    case 'under-review':
      return (
        <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">Under Review</Badge>
      );
    case 'submitted':
      return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Submitted</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-700 border-gray-200">{status}</Badge>;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

interface AssessmentMobileProps {
  assessments: Assessment[];
  selectedAssessments: string[];
  onSelectAssessment: (id: string, checked: boolean) => void;
  onViewAssessment: (assessment: Assessment) => void;
  onDownloadAssessment: (assessment: Assessment) => void;
  onStatusChange: (id: string, status: 'under-review' | 'rejected', assessment: Assessment) => void;
}

export default function AssessmentMobile({
  assessments,
  selectedAssessments,
  onSelectAssessment,
  onViewAssessment,
  onDownloadAssessment,
  onStatusChange,
}: AssessmentMobileProps) {
  if (assessments.length === 0) {
    return <Box className="text-center py-8 text-gray-500">No assessments found.</Box>;
  }

  return (
    <Box className="sm:hidden space-y-3">
      {assessments.map(assessment => (
        <Box
          key={assessment._id}
          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
        >
          <Box className="flex items-start justify-between gap-3">
            <Box className="flex-1">
              <Box className="flex items-center justify-between">
                <Box>
                  <Box className="font-medium text-gray-900 capitalize">
                    {getApplicantName(assessment)}
                  </Box>
                  <Box className="text-xs text-gray-500">{getApplicantEmail(assessment)}</Box>
                </Box>
                <Box className="text-xs text-gray-600">{assessment.application.cohort.name}</Box>
              </Box>

              <Box className="mt-2 flex flex-wrap items-center gap-2">
                <Box className="text-sm text-gray-700">{assessment.application.track.name}</Box>
                {getStatusBadge(assessment.status)}
              </Box>

              <Box className="mt-2 text-xs text-gray-600">
                Submitted: {formatDate(assessment.submittedAt)}
              </Box>
            </Box>
          </Box>

          <Box className="mt-3 flex gap-2 flex-wrap">
            {/* View Button */}
            <Button
              size="sm"
              onClick={() => onViewAssessment(assessment)}
              className="flex-1 flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 cursor-pointer transition-colors duration-200 font-medium"
              aria-label={`View details for ${getApplicantName(assessment)}`}
            >
              <Eye className="w-4 h-4" />
              View
            </Button>

            {/* Download Button */}
            <Button
              size="sm"
              onClick={() => onDownloadAssessment(assessment)}
              className="flex-1 flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 cursor-pointer transition-colors duration-200 font-medium"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>

            {/* Status Update Select */}
            <Select
              value=""
              onValueChange={(value: 'under-review' | 'rejected') =>
                onStatusChange(assessment._id, value, assessment)
              }
            >
              <SelectTrigger className="flex-1 border-indigo-200 text-black focus:ring-indigo-600">
                <SelectValue placeholder="Update status" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-indigo-100 text-black">
                <SelectItem value="under-review">Mark for Review</SelectItem>
                <SelectItem value="rejected">Reject</SelectItem>
              </SelectContent>
            </Select>

            <Box className="w-full flex items-center gap-2 mt-2">
              <Checkbox
                checked={selectedAssessments.includes(assessment._id)}
                onCheckedChange={checked => onSelectAssessment(assessment._id, checked as boolean)}
                aria-label={`Select ${getApplicantName(assessment)}`}
              />
              <Box className="text-sm text-gray-600">Select for bulk action</Box>
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
