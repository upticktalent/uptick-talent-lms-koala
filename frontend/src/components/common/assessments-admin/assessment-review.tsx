import { Suspense } from 'react';

import Spinner from '../spinner';
import { Assessment } from '@/types/assessments-admin';
import AssessmentTable from './assessment-table';

export default function AssessmentReview({ assessments }: { assessments: Assessment[] }) {
  return (
    <Suspense fallback={<Spinner />}>
      <AssessmentTable assessments={assessments} />
    </Suspense>
  );
}
