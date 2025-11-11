import { Applicant } from '@/types/assessments-admin';

export interface ApplicationsTableProps {
  applications: Applicant[];
}

export interface ApplicationsFilters {
  search: string;
  trackFilter: string;
  statusFilter: string;
  page: number;
  pageSize: number;
}

export interface ApplicationsActions {
  onSelectApplicant: (id: string, checked: boolean) => void;
  onViewApplicant: (applicant: Applicant) => void;
  onStatusChange: (id: string, status: Applicant['status'], applicant: Applicant) => void;
}

export interface ApplicationsMobileProps extends ApplicationsActions {
  applicants: Applicant[];
  selectedApplicants: string[];
  loadingIds: Set<string>;
}
