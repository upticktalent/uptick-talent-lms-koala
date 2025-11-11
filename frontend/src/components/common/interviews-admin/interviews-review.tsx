import { Suspense } from 'react';

import Spinner from '../spinner';
import InterviewsTable from './interviews-table';

interface Interview {
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

export default function InterviewsReview({ interviewsData }: { interviewsData: Interview[] }) {
  return (
    <Suspense fallback={<Spinner />}>
      <InterviewsTable interviews={interviewsData} />
    </Suspense>
  );
}
