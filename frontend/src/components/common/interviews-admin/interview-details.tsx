'use client';

import { Badge } from '@/components/ui/badge';
import Box from '@/components/ui/box';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Video, ExternalLink } from 'lucide-react';

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

const getStatusBadge = (status: Interview['status']) => {
  const config = {
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

  const { label, className } = config[status];

  return (
    <Badge variant="outline" className={`text-sm font-medium ${className}`}>
      {label}
    </Badge>
  );
};

interface InterviewDetailsProps {
  interview: Interview;
  onClose: () => void;
}

export default function InterviewDetails({ interview, onClose }: InterviewDetailsProps) {
  return (
    <Box className="space-y-4 text-gray-700">
      <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Applicant Information */}
        <Box className="space-y-2">
          <h3 className="font-semibold text-gray-900">Applicant</h3>
          <Box>
            <Box className="font-medium">{interview.applicant.name}</Box>
            <Box className="text-sm text-gray-500">{interview.applicant.email}</Box>
          </Box>
        </Box>

        {/* Interviewer Information */}
        <Box className="space-y-2">
          <h3 className="font-semibold text-gray-900">Interviewer</h3>
          <Box>
            <Box className="font-medium">{interview.interviewer.name}</Box>
            <Box className="text-sm text-gray-500">{interview.interviewer.email}</Box>
          </Box>
        </Box>

        {/* Track & Status */}
        <Box className="space-y-2">
          <h3 className="font-semibold text-gray-900">Track</h3>
          <Box className="font-medium">{interview.track}</Box>
        </Box>

        <Box className="space-y-2">
          <h3 className="font-semibold text-gray-900">Status</h3>
          {getStatusBadge(interview.status)}
        </Box>

        {/* Date & Time */}
        <Box className="space-y-2">
          <h3 className="font-semibold text-gray-900">Date & Time</h3>
          <Box className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <Box className="font-medium">{interview.date}</Box>
          </Box>
          <Box className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <Box className="font-medium">{interview.time}</Box>
          </Box>
        </Box>

        {/* Meeting Details */}
        <Box className="space-y-2">
          <h3 className="font-semibold text-gray-900">Meeting Type</h3>
          <Box className="flex items-center gap-2">
            {interview.meetingType === 'virtual' ? (
              <>
                <Video className="w-4 h-4 text-gray-400" />
                <Box className="font-medium">Virtual Meeting</Box>
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 text-gray-400" />
                <Box className="font-medium">In-Person</Box>
              </>
            )}
          </Box>
          {interview.meetingType === 'virtual' && interview.meetingLink && (
            <Button asChild variant="outline" className="border-indigo-600 text-indigo-600 mt-2">
              <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Join Meeting
              </a>
            </Button>
          )}
          {interview.meetingType === 'in-person' && interview.location && (
            <Box className="text-sm text-gray-600 mt-1">Location: {interview.location}</Box>
          )}
        </Box>
      </Box>

      {/* Additional Information */}
      <Box className="border-t pt-4">
        <h3 className="font-semibold text-gray-900 mb-2">Additional Information</h3>
        <Box className="text-sm text-gray-600">Interview ID: {interview.id}</Box>
        <Box className="text-sm text-gray-600">
          Created:{' '}
          {new Date(interview.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Box>
      </Box>

      <Box className="flex justify-end gap-2 pt-4">
        <Button onClick={onClose}>Close</Button>
      </Box>
    </Box>
  );
}
