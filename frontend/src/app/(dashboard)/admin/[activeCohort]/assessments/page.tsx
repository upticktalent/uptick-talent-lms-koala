import AssessmentReview from '@/components/common/assessments-admin/assessment-review';
import { getAssessments } from '@/lib/api/data-service';
import React from 'react';

export default async function AssessmentPage() {
  const assessments = await getAssessments();
  return <AssessmentReview assessments={assessments} />;
}
