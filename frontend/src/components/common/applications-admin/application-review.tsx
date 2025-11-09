import { Suspense } from 'react';
import Spinner from '../spinner';
import { Applicant } from '@/types/assessments-admin';
import ApplicationsTable from './application-table';

export default function ApplicationsReview({ applications }: { applications: Applicant[] }) {
  return (
    <Suspense fallback={<Spinner />}>
      <ApplicationsTable applications={applications} />
    </Suspense>
  );
}
