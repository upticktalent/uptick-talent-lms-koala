'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Calendar, Clock, MapPin, Video } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Box from '@/components/ui/box';

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
    <Badge variant="outline" className={`text-xs font-medium ${className}`}>
      {label}
    </Badge>
  );
};

interface InterviewsMobileProps {
  interviews: Interview[];
  onViewInterview: (interview: Interview) => void;
  onUpdateInterview: (id: string, status: Interview['status']) => void;
  loadingIds?: Set<string>;
}

export default function InterviewsMobile({
  interviews,
  onViewInterview,
  onUpdateInterview,
  loadingIds = new Set(),
}: InterviewsMobileProps) {
  const isInterviewLoading = (id: string) => loadingIds.has(id);

  if (interviews.length === 0) {
    return <Box className="text-center py-8 text-gray-500">No interviews found.</Box>;
  }

  return (
    <Box className="sm:hidden space-y-3">
      {interviews.map(interview => (
        <Box
          key={interview.id}
          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
        >
          <Box className="flex items-start justify-between gap-3">
            <Box className="flex-1">
              {/* Applicant & Interviewer */}
              <Box className="space-y-2">
                <Box>
                  <Box className="font-medium text-gray-900">{interview.applicant.name}</Box>
                  <Box className="text-xs text-gray-500">{interview.applicant.email}</Box>
                </Box>
                <Box className="text-sm text-gray-600">with {interview.interviewer.name}</Box>
              </Box>

              {/* Track & Status */}
              <Box className="mt-2 flex flex-wrap items-center gap-2">
                <Box className="text-sm font-medium text-gray-700">{interview.track}</Box>
                {getStatusBadge(interview.status)}
              </Box>

              {/* Date & Time */}
              <Box className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                <Calendar className="w-4 h-4 text-gray-400" />
                {interview.date}
                <Clock className="w-4 h-4 text-gray-400 ml-2" />
                {interview.time}
              </Box>

              {/* Meeting Details */}
              <Box className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                {interview.meetingType === 'virtual' ? (
                  <>
                    <Video className="w-3 h-3" />
                    Virtual
                    {interview.meetingLink && ' • Link available'}
                  </>
                ) : (
                  <>
                    <MapPin className="w-3 h-3" />
                    In-Person
                    {interview.location && ` • ${interview.location}`}
                  </>
                )}
              </Box>
            </Box>
          </Box>

          {/* Actions */}
          <Box className="mt-3 flex gap-2 flex-wrap">
            <Button
              size="sm"
              onClick={() => onViewInterview(interview)}
              className="flex-1 flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 cursor-pointer transition-colors duration-200 font-medium"
            >
              <Eye className="w-4 h-4" />
              View Details
            </Button>

            <Select
              value={interview.status}
              onValueChange={(value: Interview['status']) => onUpdateInterview(interview.id, value)}
              disabled={isInterviewLoading(interview.id)}
            >
              <SelectTrigger className="flex-1 border-indigo-200 text-black focus:ring-indigo-600 disabled:opacity-50">
                <SelectValue placeholder="Update status" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-indigo-100 text-black">
                <SelectItem className="focus:bg-indigo-600" value="scheduled">
                  Scheduled
                </SelectItem>
                <SelectItem className="focus:bg-indigo-600" value="completed">
                  Completed
                </SelectItem>
                <SelectItem className="focus:bg-indigo-600" value="cancelled">
                  Cancelled
                </SelectItem>
              </SelectContent>
            </Select>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
