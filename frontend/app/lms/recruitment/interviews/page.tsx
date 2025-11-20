'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { interviewService } from '@/services/interviewService';
import { trackService } from '@/services/trackService';
import { useFetch } from '@/hooks/useFetch';
import { formatDate, formatDateTime, formatTime } from '@/utils/formatDate';
import { RoleGuard } from '@/middleware/roleGuard';
import Link from 'next/link';
import { Calendar, Clock, Users, Plus, Filter } from 'lucide-react';
import Loader from '@/components/Loader';

export default function InterviewsPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [interviewerFilter, setInterviewerFilter] = useState('all');
  const [trackFilter, setTrackFilter] = useState('all');

  const [interviews, setInterviews] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        interviewer:
          interviewerFilter !== 'all' ? interviewerFilter : undefined,
        track: trackFilter !== 'all' ? trackFilter : undefined,
      };

      const response = await interviewService.getInterviews(params);

      if (response.data.success) {
        setInterviews(response.data.data?.interviews || []);
      } else {
        setError(response.data.message || 'Failed to fetch interviews');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to fetch interviews'
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch interviews on component mount and when filters change
  useEffect(() => {
    fetchInterviews();
  }, [statusFilter, interviewerFilter, trackFilter]);

  const fetchTracks = async () => {
    try {
      const response = await trackService.getActiveTracks();

      if (response.data.success) {
        // getActiveTracks returns data directly as an array
        const tracksData = response.data.data;
        setTracks(Array.isArray(tracksData) ? tracksData : []);
      } else {
        setTracks([]);
      }
    } catch (error) {
      console.error('Failed to fetch tracks:', error);
      setTracks([]);
    }
  };

  // Fetch tracks on component mount
  useEffect(() => {
    fetchTracks();
  }, []);

  const refetch = () => {
    fetchInterviews();
  };

  const statuses = [
    { value: 'all', label: 'All Interviews' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'interviewed', label: 'Interviewed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'interviewed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getResultColor = (status: string) => {
    switch (status) {
      case 'interviewed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <Loader text='Loading interviews...' />;
  }

  if (error) {
    return (
      <div className='text-center text-red-600'>
        Failed to load interviews: {error}
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin', 'mentor']}>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex justify-between items-center'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Interview Management
            </h1>
            <p className='text-gray-600'>
              Schedule, manage, and review applicant interviews
            </p>
          </div>
          <div className='flex gap-3'>
            <Link href='/lms/recruitment/interviews/schedule'>
              <Button variant='secondary'>
                <Users className='w-4 h-4 mr-2' />
                Public Schedule
              </Button>
            </Link>
            <Link href='/lms/recruitment/interview-slots'>
              <Button>
                <Calendar className='w-4 h-4 mr-2' />
                Manage Slots
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className='flex gap-4 flex-wrap'>
          <div className='w-48'>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          <div className='w-48'>
            <select
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value='all'>All Tracks</option>
              {Array.isArray(tracks) &&
                tracks.map((track) => (
                  <option key={track._id} value={track._id}>
                    {track.name}
                  </option>
                ))}
            </select>
          </div>
          {(statusFilter !== 'all' || trackFilter !== 'all') && (
            <Button
              variant='secondary'
              onClick={() => {
                setStatusFilter('all');
                setTrackFilter('all');
                // No need to call refetch here since useEffect will handle it
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center'>
                <Calendar className='h-4 w-4 text-muted-foreground' />
                <div className='ml-2'>
                  <div className='text-2xl font-bold'>{interviews.length}</div>
                  <p className='text-xs text-muted-foreground'>
                    Total Interviews
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center'>
                <Clock className='h-4 w-4 text-blue-600' />
                <div className='ml-2'>
                  <div className='text-2xl font-bold text-blue-600'>
                    {
                      interviews.filter((i: any) => i.status === 'scheduled')
                        .length
                    }
                  </div>
                  <p className='text-xs text-muted-foreground'>Scheduled</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center'>
                <Users className='h-4 w-4 text-green-600' />
                <div className='ml-2'>
                  <div className='text-2xl font-bold text-green-600'>
                    {
                      interviews.filter((i: any) => i.status === 'interviewed')
                        .length
                    }
                  </div>
                  <p className='text-xs text-muted-foreground'>Interviewed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center'>
                <Users className='h-4 w-4 text-red-600' />
                <div className='ml-2'>
                  <div className='text-2xl font-bold text-red-600'>
                    {
                      interviews.filter((i: any) => i.status === 'cancelled')
                        .length
                    }
                  </div>
                  <p className='text-xs text-muted-foreground'>Cancelled</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interviews List */}
        <div className='space-y-4'>
          {interviews.length === 0 ? (
            <Card>
              <CardContent className='pt-6 text-center text-gray-500'>
                No interviews found matching your criteria.
              </CardContent>
            </Card>
          ) : (
            interviews.map((interview: any) => (
              <Card key={interview._id}>
                <CardContent className='pt-6'>
                  <div className='flex items-center justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-4 mb-3'>
                        <div>
                          <h3 className='font-semibold text-gray-900'>
                            Interview #{interview._id.slice(-6)}
                          </h3>
                          <p className='text-sm text-gray-600'>
                            Applicant:{' '}
                            {interview.application?.applicant?.firstName}{' '}
                            {interview.application?.applicant?.lastName}
                          </p>
                          <p className='text-sm text-gray-500'>
                            Interviewer: {interview.interviewer?.firstName}{' '}
                            {interview.interviewer?.lastName}
                          </p>
                        </div>
                        <div className='flex gap-2'>
                          {interview.status && (
                            <Badge className={getResultColor(interview.status)}>
                              {interview.status.toUpperCase()}
                            </Badge>
                          )}
                          {interview.rating && (
                            <Badge variant='secondary'>
                              ⭐ {interview.rating}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600'>
                        <div>
                          <span className='font-medium'>Date & Time:</span>
                          <div className='ml-1'>
                            {formatDateTime(`${interview.scheduledDate}`)}
                          </div>
                        </div>
                        <div>
                          <span className='font-medium'>Interview Link:</span>
                          <div className='ml-1'>
                            {interview.meetingLink ? (
                              <a
                                href={interview.meetingLink}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-blue-600 hover:underline'
                              >
                                Join Meeting
                              </a>
                            ) : (
                              'Not provided'
                            )}
                          </div>
                        </div>
                        <div>
                          <span className='font-medium'>Scheduled:</span>
                          <div className='ml-1'>
                            {formatDate(interview.createdAt)}
                          </div>
                        </div>
                      </div>

                      {interview.notes && (
                        <div className='mt-3 p-3 bg-gray-50 rounded-md'>
                          <span className='text-sm font-medium text-gray-700'>
                            Notes:
                          </span>
                          <p className='text-sm text-gray-600 mt-1'>
                            {interview.notes}
                          </p>
                        </div>
                      )}

                      {interview.feedback && (
                        <div className='mt-3 p-3 bg-blue-50 rounded-md'>
                          <span className='text-sm font-medium text-gray-700'>
                            Feedback:
                          </span>
                          <p className='text-sm text-gray-600 mt-1'>
                            {interview.feedback}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className='flex gap-2'>
                      <Link
                        href={`/lms/recruitment/interviews/${interview._id}`}
                      >
                        <Button variant='secondary' size='sm'>
                          {interview.status === 'scheduled'
                            ? 'Manage'
                            : 'View Details'}
                        </Button>
                      </Link>
                      {interview.status === 'scheduled' && (
                        <Link
                          href={`/lms/recruitment/interviews/${interview._id}/edit`}
                        >
                          <Button variant='secondary' size='sm'>
                            Edit
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
