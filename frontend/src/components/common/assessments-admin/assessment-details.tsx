import { Badge } from '@/components/ui/badge';
import Box from '@/components/ui/box';
import { Separator } from '@/components/ui/separator';
import { Assessment } from '@/types/assessments-admin';
import { getFullName } from '@/utils/helper';
import { Mail, Calendar, ExternalLink } from 'lucide-react';

interface AssessmentDetailsProps {
  assessment: Assessment;
}

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
    case 'reviewed':
      return <Badge className="bg-green-100 text-green-700 border-green-200">Reviewed</Badge>;
    case 'under-review':
      return (
        <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">Under Review</Badge>
      );
    default:
      return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Submitted</Badge>;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function AssessmentDetails({ assessment }: AssessmentDetailsProps) {
  return (
    <Box className="space-y-6 py-4 px-2 sm:px-4">
      {/* Applicant Information */}
      <Box className="space-y-3">
        <h3 className="text-slate-900 font-medium text-lg">Applicant Information</h3>
        <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 sm:p-5 bg-gray-50 rounded-lg">
          <Box>
            <p className="text-sm text-gray-600">Name</p>
            <p className="text-slate-900">{getApplicantName(assessment)}</p>
          </Box>
          <Box>
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-slate-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              {getApplicantEmail(assessment)}
            </p>
          </Box>
          <Box>
            <p className="text-sm text-gray-600">Track</p>
            <Badge className="bg-blue-100 text-blue-700">{assessment.application.track.name}</Badge>
          </Box>
          <Box>
            <p className="text-sm text-gray-600">Cohort</p>
            <Badge variant="outline" className="text-gray-700">
              {assessment.application.cohort.name}
            </Badge>
          </Box>
          <Box>
            <p className="text-sm text-gray-600">Education</p>
            <p className="text-slate-900 text-sm">
              {assessment.application.educationalQualification}
            </p>
          </Box>
          <Box>
            <p className="text-sm text-gray-600">Submitted Date</p>
            <p className="text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              {formatDate(assessment.submittedAt)}
            </p>
          </Box>
        </Box>
      </Box>

      <Separator />

      {/* Assessment Details */}
      <Box className="space-y-3">
        <h3 className="text-slate-900 font-medium text-lg">Assessment Details</h3>
        <Box className="space-y-3">
          <Box>
            <p className="text-sm text-gray-600">Submission Type</p>
            <Badge variant="outline" className="text-gray-700">
              {assessment.submissionType}
            </Badge>
          </Box>
          <Box>
            <p className="text-sm text-gray-600">Assessment File</p>
            <a
              href={assessment.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 hover:underline"
            >
              View Assessment File
              <ExternalLink className="w-3 h-3" />
            </a>
          </Box>
          <Box>
            <p className="text-sm text-gray-600">CV/Resume</p>
            <a
              href={assessment.application.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 hover:underline"
            >
              View CV
              <ExternalLink className="w-3 h-3" />
            </a>
          </Box>
        </Box>
      </Box>

      <Separator />

      {/* Notes */}
      <Box className="space-y-2">
        <p className="text-sm text-gray-600">Applicant Notes</p>
        <Box className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-700 break-words">
            {assessment.notes || 'No notes provided.'}
          </p>
        </Box>
      </Box>

      <Separator />

      {/* Tools & Skills */}
      {assessment.application.tools && assessment.application.tools.length > 0 && (
        <Box className="space-y-2">
          <p className="text-sm text-gray-600">Tools & Technologies</p>
          <Box className="flex flex-wrap gap-2">
            {assessment.application.tools.map((tool, index) => (
              <Badge key={index} variant="outline" className="text-gray-700">
                {tool}
              </Badge>
            ))}
          </Box>
        </Box>
      )}

      <Separator />

      {/* Status */}
      <Box>
        <p className="text-sm text-gray-600 mb-2">Status</p>
        {getStatusBadge(assessment.status)}
      </Box>
    </Box>
  );
}
