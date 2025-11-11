import { Assessment } from '@/types/assessments-admin';

export interface AssessmentTableProps {
  assessments: Assessment[];
}

export interface AssessmentFilters {
  search: string;
  trackFilter: string;
  statusFilter: string;
  page: number;
  pageSize: number;
}

export interface AssessmentActions {
  onSelectAssessment: (id: string, checked: boolean) => void;
  onViewAssessment: (assessment: Assessment) => void;
  onDownloadAssessment: (assessment: Assessment) => void;
  onStatusChange: (id: string, status: Assessment['status'], assessment: Assessment) => void;
}

export interface AssessmentMobileProps extends AssessmentActions {
  assessments: Assessment[];
  selectedAssessments: string[];
  loadingIds: Set<string>;
}
