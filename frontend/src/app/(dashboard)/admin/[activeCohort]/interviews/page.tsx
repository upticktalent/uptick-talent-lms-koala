import InterviewsTable from '@/components/common/interviews-admin/interviews-table';
import { Metadata } from 'next';
import React from 'react';

const interviewsData = [
  {
    id: '1',
    applicant: {
      name: 'John Doe',
      email: 'john.doe@email.com',
    },
    track: 'Frontend Development',
    interviewer: {
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
    },
    date: '12 Nov 2025',
    time: '10:00 AM',
    status: 'scheduled' as const,
    meetingType: 'virtual' as const,
    meetingLink: 'https://meet.google.com/abc-def-ghi',
    createdAt: '2025-11-10T09:00:00Z',
  },
  {
    id: '2',
    applicant: {
      name: 'Amaka Bello',
      email: 'amaka.bello@email.com',
    },
    track: 'Product Design',
    interviewer: {
      name: 'David Lin',
      email: 'david.lin@company.com',
    },
    date: '10 Nov 2025',
    time: '3:30 PM',
    status: 'completed' as const,
    meetingType: 'in-person' as const,
    meetingLink: '',
    createdAt: '2025-11-09T14:00:00Z',
  },
  {
    id: '3',
    applicant: {
      name: 'Tunde Bakare',
      email: 'tunde.bakare@email.com',
    },
    track: 'Backend Engineering',
    interviewer: {
      name: 'Sarah Ojo',
      email: 'sarah.ojo@company.com',
    },
    date: '13 Nov 2025',
    time: '1:00 PM',
    status: 'cancelled' as const,
    meetingType: 'virtual' as const,
    meetingLink: 'https://zoom.us/j/9837432098',
    createdAt: '2025-11-10T10:00:00Z',
  },
  {
    id: '4',
    applicant: {
      name: 'Samuel Adeyemi',
      email: 'samuel.adeyemi@email.com',
    },
    track: 'Data Science',
    interviewer: {
      name: 'Olivia Green',
      email: 'olivia.green@company.com',
    },
    date: '14 Nov 2025',
    time: '11:30 AM',
    status: 'scheduled' as const,
    meetingType: 'virtual' as const,
    meetingLink: 'https://meet.google.com/jkl-mno-pqr',
    createdAt: '2025-11-10T09:45:00Z',
  },
  {
    id: '5',
    applicant: {
      name: 'Linda Johnson',
      email: 'linda.johnson@email.com',
    },
    track: 'UI/UX Design',
    interviewer: {
      name: 'Mark Daniels',
      email: 'mark.daniels@company.com',
    },
    date: '09 Nov 2025',
    time: '2:00 PM',
    status: 'completed' as const,
    meetingType: 'in-person' as const,
    meetingLink: '',
    createdAt: '2025-11-08T16:30:00Z',
  },
];

export const metadata: Metadata = {
  title: 'Interview Page | Uptick Talent',
};

export default function InterviewPage() {
  return <InterviewsTable interviews={interviewsData} />;
}
