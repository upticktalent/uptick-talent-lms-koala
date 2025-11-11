export interface Interview {
  id: string;
  applicant: {
    name: string;
    email: string;
  };
  track: string;
  interviewer: {
    name: string;
    email: string;
  };
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  meetingType: 'virtual' | 'in-person';
  meetingLink?: string;
  location?: string;
  createdAt: string;
}

export interface InterviewsTableProps {
  interviews: Interview[];
}

export interface InterviewsFilters {
  search: string;
  trackFilter: string;
  statusFilter: string;
  page: number;
  pageSize: number;
}

export interface InterviewsActions {
  onSelectInterview: (id: string, checked: boolean) => void;
  onViewInterview: (interview: Interview) => void;
  onStatusChange: (id: string, status: Interview['status']) => void;
}

export interface InterviewsMobileProps extends Omit<InterviewsActions, 'onSelectInterview'> {
  interviews: Interview[];
  loadingIds: Set<string>;
}
