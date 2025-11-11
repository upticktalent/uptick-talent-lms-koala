import { Assessment } from '@/types/assessments-admin';
import { getFullName } from '@/utils/helper';

// Helper functions
export const getApplicantName = (assessment: Assessment): string => {
  return (
    getFullName(
      assessment.application.applicant?.firstName,
      assessment.application.applicant?.lastName,
    ) || 'Unknown Applicant'
  );
};

export const getApplicantEmail = (assessment: Assessment): string => {
  return assessment.application.applicant?.email || 'No email';
};

export const getTrackName = (assessment: Assessment): string => {
  return assessment.application.track?.name || 'Unknown Track';
};

export const getCohortName = (assessment: Assessment): string => {
  return assessment.application.cohort?.name || 'Unknown Cohort';
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return 'No date';

  try {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? 'Invalid Date'
      : date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
  } catch {
    return 'Invalid Date';
  }
};

export const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'reviewed':
      return { className: 'bg-green-100 text-green-700 border-green-200', label: 'Reviewed' };
    case 'under-review':
      return {
        className: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        label: 'Under Review',
      };
    default:
      return { className: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Submitted' };
  }
};
