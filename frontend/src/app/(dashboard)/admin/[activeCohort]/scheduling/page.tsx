import InterviewBooking from '@/components/common/interviews-admin/interview-booking';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Schedulling Interview | Uptick Talent',
};

export default function SchedullingPage() {
  return <InterviewBooking />;
}
