'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { interviewSlotService } from '@/services/interviewSlotService';
import { useFetch } from '@/hooks/useFetch';
import { formatDate, formatTime } from '@/utils/formatDate';
import { RoleGuard } from '@/middleware/roleGuard';
import { ArrowLeft, Calendar, Clock, Users, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function InterviewSlotDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, loading, error, refetch } = useFetch(() =>
    interviewSlotService.getSlot(params.id)
  );
  const slot = data?.slot;

  const getAvailabilityColor = (slot: any) => {
    if (!slot.isAvailable) return 'bg-gray-100 text-gray-800';
    if (slot.bookedCount >= slot.maxInterviews)
      return 'bg-red-100 text-red-800';
    if (slot.bookedCount > 0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getAvailabilityText = (slot: any) => {
    if (!slot.isAvailable) return 'Unavailable';
    if (slot.bookedCount >= slot.maxInterviews) return 'Fully Booked';
    if (slot.bookedCount > 0) return 'Partially Booked';
    return 'Available';
  };

  const handleDelete = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this interview slot? This action cannot be undone.'
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await interviewSlotService.deleteSlot(params.id);
      toast.success('Interview slot deleted successfully!');
      router.push('/lms/recruitment/interview-slots');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to delete interview slot'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      await interviewSlotService.updateSlot(params.id, {
        isAvailable: !slot.isAvailable,
      });
      toast.success(
        `Interview slot ${
          slot.isAvailable ? 'disabled' : 'enabled'
        } successfully!`
      );
      refetch();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to update interview slot'
      );
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-64'>
        <div className='text-gray-600'>Loading interview slot details...</div>
      </div>
    );
  }

  if (error || !slot) {
    return (
      <div className='text-center text-red-600'>
        Interview slot not found or failed to load
      </div>
    );
  }

  const slotDurationMinutes = Math.floor(
    (new Date(`1970-01-01T${slot.endTime}`).getTime() -
      new Date(`1970-01-01T${slot.startTime}`).getTime()) /
      (1000 * 60)
  );

  return (
    <RoleGuard allowedRoles={['admin', 'mentor']}>
      <div className='max-w-4xl mx-auto space-y-6'>
        {/* Header */}
        <div className='flex items-center gap-4'>
          <Link href='/lms/recruitment/interview-slots'>
            <Button variant='secondary' size='sm'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back to Slots
            </Button>
          </Link>
          <div className='flex-1'>
            <h1 className='text-2xl font-bold text-gray-900'>
              Interview Slot Details
            </h1>
            <p className='text-gray-600'>
              {formatDate(slot.date)} - {formatTime(slot.startTime)} to{' '}
              {formatTime(slot.endTime)}
            </p>
          </div>
          <div className='flex gap-2'>
            <Badge className={getAvailabilityColor(slot)}>
              {getAvailabilityText(slot)}
            </Badge>
            {slot.interviewType && (
              <Badge variant='outline'>{slot.interviewType}</Badge>
            )}
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Slot Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Calendar className='w-5 h-5' />
                Slot Information
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <label className='text-sm font-medium text-gray-700'>
                  Date
                </label>
                <p className='text-sm text-gray-900'>{formatDate(slot.date)}</p>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Start Time
                  </label>
                  <p className='text-sm text-gray-900'>
                    {formatTime(slot.startTime)}
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    End Time
                  </label>
                  <p className='text-sm text-gray-900'>
                    {formatTime(slot.endTime)}
                  </p>
                </div>
              </div>

              <div>
                <label className='text-sm font-medium text-gray-700'>
                  Duration
                </label>
                <p className='text-sm text-gray-900'>
                  {slotDurationMinutes} minutes
                </p>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Capacity
                  </label>
                  <p className='text-sm text-gray-900'>
                    {slot.bookedCount} / {slot.maxInterviews} interviews
                  </p>
                </div>
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Status
                  </label>
                  <p className='text-sm text-gray-900'>
                    {slot.isAvailable ? 'Available' : 'Unavailable'}
                  </p>
                </div>
              </div>

              {slot.tracks && slot.tracks.length > 0 && (
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Available for Tracks
                  </label>
                  <p className='text-sm text-gray-900'>
                    {slot.tracks.map((track: any) => track.name).join(', ')}
                  </p>
                </div>
              )}

              {slot.interviewType && (
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Interview Type
                  </label>
                  <p className='text-sm text-gray-900 capitalize'>
                    {slot.interviewType}
                  </p>
                </div>
              )}

              <div>
                <label className='text-sm font-medium text-gray-700'>
                  Created
                </label>
                <p className='text-sm text-gray-900'>
                  {formatDate(slot.createdAt)}
                </p>
              </div>

              {slot.updatedAt !== slot.createdAt && (
                <div>
                  <label className='text-sm font-medium text-gray-700'>
                    Last Updated
                  </label>
                  <p className='text-sm text-gray-900'>
                    {formatDate(slot.updatedAt)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interviewer Information */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Users className='w-5 h-5' />
                Interviewer Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='p-4 bg-gray-50 rounded-md'>
                <p className='font-medium text-gray-900'>
                  {slot.interviewer?.firstName} {slot.interviewer?.lastName}
                </p>
                <p className='text-sm text-gray-600'>
                  {slot.interviewer?.email}
                </p>
                <p className='text-sm text-gray-600 capitalize'>
                  Role: {slot.interviewer?.role}
                </p>
                {slot.interviewer?.phoneNumber && (
                  <p className='text-sm text-gray-600'>
                    {slot.interviewer.phoneNumber}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {slot.notes && (
            <div className='lg:col-span-2'>
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='p-3 bg-gray-50 rounded-md'>
                    <p className='text-sm text-gray-900'>{slot.notes}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Booked Interviews */}
          {slot.interviews && slot.interviews.length > 0 && (
            <div className='lg:col-span-2'>
              <Card>
                <CardHeader>
                  <CardTitle>Booked Interviews</CardTitle>
                  <CardDescription>
                    Interviews scheduled for this slot
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {slot.interviews.map((interview: any) => (
                      <div
                        key={interview._id}
                        className='flex items-center justify-between p-3 border rounded-md'
                      >
                        <div>
                          <p className='font-medium text-gray-900'>
                            {interview.applicationId?.firstName}{' '}
                            {interview.applicationId?.lastName}
                          </p>
                          <p className='text-sm text-gray-600'>
                            {interview.applicationId?.email}
                          </p>
                          <p className='text-sm text-gray-500'>
                            Status:{' '}
                            <span className='capitalize'>
                              {interview.status}
                            </span>
                          </p>
                        </div>
                        <div className='flex gap-2'>
                          <Link
                            href={`/lms/recruitment/interviews/${interview._id}`}
                          >
                            <Button variant='secondary' size='sm'>
                              View Interview
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Manage this interview slot</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex gap-3'>
              <Link href={`/lms/recruitment/interview-slots/${params.id}/edit`}>
                <Button variant='secondary'>
                  <Edit className='w-4 h-4 mr-2' />
                  Edit Slot
                </Button>
              </Link>

              <Button variant='secondary' onClick={handleToggleStatus}>
                {slot.isAvailable ? 'Disable' : 'Enable'} Slot
              </Button>

              <Button
                variant='danger'
                onClick={handleDelete}
                disabled={isDeleting || slot.bookedCount > 0}
              >
                <Trash2 className='w-4 h-4 mr-2' />
                {isDeleting ? 'Deleting...' : 'Delete Slot'}
              </Button>
            </div>

            {slot.bookedCount > 0 && (
              <p className='text-sm text-gray-500 mt-2'>
                Cannot delete slot with booked interviews. Cancel interviews
                first.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
