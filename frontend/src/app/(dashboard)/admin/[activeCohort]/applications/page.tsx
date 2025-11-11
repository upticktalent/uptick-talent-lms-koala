import ApplicationReview from '@/components/common/applications-admin/application-review';

import { getApplications } from '@/lib/api/data-service';
import { Metadata } from 'next';
import React from 'react';

export const revalidate = 10;

export const metadata: Metadata = {
  title: 'Applications | Uptick Talent',
};

export default async function ApplicationPage() {
  const applications = await getApplications();
  return <ApplicationReview applications={applications} />;
}
