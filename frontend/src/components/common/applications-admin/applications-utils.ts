import { Applicant } from '@/types/assessments-admin';

// Helper functions
export const getApplicantName = (app: Applicant): string => {
  if (!app.applicant) return 'Unknown Applicant';
  return (
    `${app.applicant.firstName || ''} ${app.applicant.lastName || ''}`.trim() || 'Unknown Applicant'
  );
};

export const getApplicantEmail = (app: Applicant): string => {
  return app.applicant?.email || 'No email';
};

export const getTrackName = (app: Applicant): string => {
  return app.track?.name || 'Unknown Track';
};

export const getCohortName = (app: Applicant): string => {
  return app.cohort?.name || 'Unknown Cohort';
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
    case 'rejected':
      return { className: 'bg-red-100 text-red-700 border-red-200', label: 'Rejected' };
    case 'shortlisted':
      return { className: 'bg-indigo-100 text-indigo-700 border-indigo-200', label: 'Shortlisted' };
    default:
      return { className: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Pending' };
  }
};

export const getStatusOptions = () => {
  return ['pending', 'shortlisted', 'rejected'] as const;
};

export const getFeedbackMessage = (status: Applicant['status']): string => {
  switch (status) {
    case 'shortlisted':
      return 'Good candidate';
    case 'rejected':
      return 'Does not meet the minimum requirements for this track.';
    default:
      return 'Status updated';
  }
};
