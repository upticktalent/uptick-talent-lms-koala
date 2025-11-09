import { Badge } from '@/components/ui/badge';
import Box from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { Applicant } from '@/types/assessments-admin';
import { Download } from 'lucide-react';

interface ApplicantDetailsProps {
  applicant: Applicant;
  onClose: () => void;
}

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

export default function ApplicantDetails({ applicant, onClose }: ApplicantDetailsProps) {
  return (
    <Box className="space-y-3 text-gray-700">
      <Box>
        <span className="font-medium">Name:</span> {getApplicantName(applicant)}
      </Box>
      <Box>
        <span className="font-medium">Email:</span> {getApplicantEmail(applicant)}
      </Box>
      <Box>
        <span className="font-medium">ID:</span> {applicant._id}
      </Box>
      <Box>
        <span className="font-medium">Track:</span> {getTrackName(applicant)}
      </Box>
      <Box>
        <span className="font-medium">Cohort:</span> {getCohortName(applicant)}
      </Box>
      <Box>
        <span className="font-medium">Status:</span> {getStatusBadge(applicant.status)}
      </Box>
      <Box>
        <span className="font-medium">Referral Source:</span>{' '}
        {applicant.referralSource || 'Not specified'}
      </Box>
      <Box>
        <span className="font-medium">Tools:</span> {(applicant.tools || []).join(', ') || 'None'}
      </Box>
      <Box>
        <span className="font-medium">Motivation:</span> {applicant.motivation || 'Not provided'}
      </Box>
      <Box>
        <span className="font-medium">Date Applied:</span> {formatDate(applicant.submittedAt)}
      </Box>

      <Box className="flex justify-end gap-2 pt-4">
        {applicant.cvUrl && (
          <Button asChild variant="outline" className="border-indigo-600 text-indigo-600">
            <a href={applicant.cvUrl} target="_blank" rel="noopener noreferrer">
              <Download className="w-4 h-4 mr-2" />
              Download CV
            </a>
          </Button>
        )}
        <Button onClick={onClose}>Close</Button>
      </Box>
    </Box>
  );
}
