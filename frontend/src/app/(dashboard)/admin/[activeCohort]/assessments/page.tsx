import AssessmentReview from '@/components/common/assessments-admin/assessment-review';
import { getAssessments } from '@/lib/api/data-service';
import { Metadata } from 'next';
import React from 'react';

export const revalidate = 10;
export const metadata: Metadata = {
  title: 'Assessments | Uptick Talent',
};

export default async function AssessmentPage() {
  const assessments = await getAssessments();
  return <AssessmentReview assessments={assessments} />;
}
