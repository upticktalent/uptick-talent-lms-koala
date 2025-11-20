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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { interviewSlotService } from '@/services/interviewSlotService';
import { trackService } from '@/services/trackService';
import { userService } from '@/services/userService';
import { formatDate, formatTime } from '@/utils/formatDate';
import { RoleGuard } from '@/middleware/roleGuard';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Plus } from 'lucide-react';
import Loader from '@/components/Loader';

export default function InterviewSlotsPage() {
  const [dateFilter, setDateFilter] = useState('');
  const [interviewerFilter, setInterviewerFilter] = useState('all');
  const [trackFilter, setTrackFilter] = useState('all');

  const [slots, setSlots] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [interviewers, setInterviewers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        date: dateFilter || undefined,
        interviewer:
          interviewerFilter !== 'all' ? interviewerFilter : undefined,
        track: trackFilter !== 'all' ? trackFilter : undefined,
      };

      const response = await interviewSlotService.getAllSlots(params);

      if (response.data.success) {
        setSlots(response.data.data?.slots || []);
      } else {
        setError(response.data.message || 'Failed to fetch slots');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || 'Failed to fetch slots'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchTracks = async () => {
    try {
      const response = await trackService.getActiveTracks();
      if (response.data.success) {
        const tracksData = response.data.data;
        setTracks(Array.isArray(tracksData) ? tracksData : []);
      }
    } catch (error) {
      console.error('Failed to fetch tracks:', error);
    }
  };

  const fetchInterviewers = async () => {
    try {
      const response = await userService.getAllUsers({
        role: ['admin', 'mentor'],
      });
      if (response.data.success) {
        setInterviewers(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch interviewers:', error);
    }
  };

  useEffect(() => {
    fetchTracks();
    fetchInterviewers();
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [dateFilter, interviewerFilter, trackFilter]);

  const refetch = () => {
    fetchSlots();
  };

  // Calculate statistics
  const totalSlots = slots.length;
  const availableSlots = slots.filter(
    (slot: any) => slot.isAvailable && slot.bookedCount < slot.maxInterviews
  ).length;
  const bookedSlots = slots.filter((slot: any) => slot.bookedCount > 0).length;
  const fullyBookedSlots = slots.filter(
    (slot: any) => slot.bookedCount >= slot.maxInterviews
  ).length;

  const getAvailabilityColor = (slot: any) => {
    const isActive = slot.isAvailable !== false;
    if (!isActive) return 'bg-gray-100 text-gray-800';
    if (slot.bookedCount >= slot.maxInterviews)
      return 'bg-red-100 text-red-800';
    if (slot.bookedCount > 0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getAvailabilityText = (slot: any) => {
    const isActive = slot.isAvailable !== false;
    if (!isActive) return 'Inactive';
    if (slot.bookedCount >= slot.maxInterviews) return 'Fully Booked';
    if (slot.bookedCount > 0) return 'Partially Booked';
    return 'Available';
  };

  if (loading) {
    return <Loader text='Loading interview slots...' />;
  }

  if (error) {
    return (
      <div className='text-center text-red-600'>
        Failed to load interview slots: {error}
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
              Interview Slots
            </h1>
            <p className='text-gray-600'>
              Manage mentor availability and interview scheduling
            </p>
          </div>
          <div className='flex gap-3'>
            <Link href='/lms/recruitment/interview-slots/create'>
              <Button>
                <Plus className='w-4 h-4 mr-2' />
                Create Slots
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center'>
                <Calendar className='h-4 w-4 text-muted-foreground' />
                <div className='ml-2'>
                  <div className='text-2xl font-bold'>{totalSlots}</div>
                  <p className='text-xs text-muted-foreground'>Total Slots</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center'>
                <Clock className='h-4 w-4 text-green-600' />
                <div className='ml-2'>
                  <div className='text-2xl font-bold text-green-600'>
                    {availableSlots}
                  </div>
                  <p className='text-xs text-muted-foreground'>Available</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center'>
                <Users className='h-4 w-4 text-yellow-600' />
                <div className='ml-2'>
                  <div className='text-2xl font-bold text-yellow-600'>
                    {bookedSlots}
                  </div>
                  <p className='text-xs text-muted-foreground'>Booked</p>
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
                    {fullyBookedSlots}
                  </div>
                  <p className='text-xs text-muted-foreground'>Full</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className='flex gap-4 flex-wrap'>
          <div className='w-48'>
            <input
              type='date'
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              placeholder='Filter by date'
            />
          </div>

          <div className='w-48'>
            <select
              value={interviewerFilter}
              onChange={(e) => setInterviewerFilter(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            >
              <option value='all'>All Interviewers</option>
              <option value='me'>My Slots</option>
              {Array.isArray(interviewers) &&
                interviewers.map((interviewer) => (
                  <option key={interviewer._id} value={interviewer._id}>
                    {interviewer.firstName} {interviewer.lastName} (
                    {interviewer.role})
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

          {(dateFilter ||
            interviewerFilter !== 'all' ||
            trackFilter !== 'all') && (
            <Button
              variant='secondary'
              onClick={() => {
                setDateFilter('');
                setInterviewerFilter('all');
                setTrackFilter('all');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Slots List */}
        <div className='space-y-4'>
          {slots.length === 0 ? (
            <Card>
              <CardContent className='pt-6 text-center text-gray-500'>
                <Calendar className='w-12 h-12 mx-auto mb-4 text-gray-300' />
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                  No interview slots found
                </h3>
                <p className='text-gray-500 mb-4'>
                  Create your first interview slots to start scheduling
                  interviews.
                </p>
                <Link href='/lms/recruitment/interview-slots/create'>
                  <Button>
                    <Plus className='w-4 h-4 mr-2' />
                    Create Slots
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            slots.map((slot: any) => (
              <Card key={slot._id}>
                <CardContent className='pt-6'>
                  <div className='flex items-center justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-4 mb-3'>
                        <div>
                          <h3 className='font-semibold text-gray-900'>
                            {formatDate(slot.date)} -{' '}
                            {formatTime(slot.startTime)} to{' '}
                            {formatTime(slot.endTime)}
                          </h3>
                          <p className='text-sm text-gray-600'>
                            Interviewer: {slot.interviewer?.firstName}{' '}
                            {slot.interviewer?.lastName} (
                            {slot.interviewer?.role})
                          </p>
                          {slot.tracks && slot.tracks.length > 0 && (
                            <p className='text-sm text-blue-600'>
                              Tracks:{' '}
                              {slot.tracks
                                .map((track: any) => track.name)
                                .join(', ')}
                            </p>
                          )}
                        </div>
                        <div className='flex gap-2'>
                          <Badge className={getAvailabilityColor(slot)}>
                            {getAvailabilityText(slot)}
                          </Badge>
                          {slot.interviewType && (
                            <Badge variant='outline'>
                              {slot.interviewType}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600'>
                        <div>
                          <span className='font-medium'>Capacity:</span>
                          <div className='ml-1'>
                            {slot.bookedCount} / {slot.maxInterviews} interviews
                          </div>
                        </div>
                        <div>
                          <span className='font-medium'>Duration:</span>
                          <div className='ml-1'>
                            {Math.floor(
                              (new Date(
                                `1970-01-01T${slot.endTime}`
                              ).getTime() -
                                new Date(
                                  `1970-01-01T${slot.startTime}`
                                ).getTime()) /
                                (1000 * 60)
                            )}{' '}
                            minutes
                          </div>
                        </div>
                        <div>
                          <span className='font-medium'>Location:</span>
                          <div className='ml-1'>
                            {slot.location || 'Online'}
                          </div>
                        </div>
                      </div>

                      {slot.notes && (
                        <div className='mt-3 p-3 bg-gray-50 rounded-md'>
                          <span className='text-sm font-medium text-gray-700'>
                            Notes:
                          </span>
                          <p className='text-sm text-gray-600 mt-1'>
                            {slot.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className='flex gap-2'>
                      <Link
                        href={`/lms/recruitment/interview-slots/${slot._id}`}
                      >
                        <Button variant='secondary' size='sm'>
                          View Details
                        </Button>
                      </Link>
                      <Link
                        href={`/lms/recruitment/interview-slots/${slot._id}/edit`}
                      >
                        <Button variant='secondary' size='sm'>
                          Edit
                        </Button>
                      </Link>
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
