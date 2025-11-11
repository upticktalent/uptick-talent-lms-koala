/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore

import { Interview } from './interviews-types';

export const getStatusBadgeVariant = (status: Interview['status']) => {
  const config: Record<Interview['status'], { label: string; className: string }> = {
    scheduled: {
      label: 'Scheduled',
      className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    },
    completed: {
      label: 'Completed',
      className: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    },
    cancelled: {
      label: 'Cancelled',
      className: 'bg-red-100 text-red-700 border-red-200',
    },
  };

  return config[status];
};

export const getTrackName = (inter: Interview): string => {
  return inter.track || 'Unknown Track';
};

export const formatDateTime = (date: string, time: string): string => {
  return `${date} at ${time}`;
};

export const getMeetingTypeDisplay = (meetingType: Interview['meetingType']): string => {
  return meetingType === 'virtual' ? 'Virtual' : 'In-Person';
};

export const tracks = [
  'Frontend Development',
  'Backend Development',
  'Mobile Development',
  'Data Science',
  'Product Management',
  'UI/UX Design',
];

export const statuses = ['All', 'scheduled', 'completed', 'cancelled'] as const;
