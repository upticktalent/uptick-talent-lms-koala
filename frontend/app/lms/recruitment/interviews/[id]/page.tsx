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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { interviewService } from '@/services/interviewService';
import { useFetch } from '@/hooks/useFetch';
import { formatDate, formatDateTime } from '@/utils/formatDate';
import { RoleGuard } from '@/middleware/roleGuard';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Edit,
  CheckCircle,
  XCircle,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import Loader from '@/components/Loader';

export default function InterviewDetailPage() {
  type RouteParam = {
    id: string;
  };
  const router = useRouter();
  const { id } = useParams() as RouteParam;
  const [activeTab, setActiveTab] = useState('details');
  const [isLoading, setIsLoading] = useState(false);

  // Review form state
  const [reviewData, setReviewData] = useState({
    feedback: '',
    status: 'accepted' as 'accepted' | 'rejected',
    rating: 5,
    notes: '',
  });

  // Reschedule form state
  const [rescheduleData, setRescheduleData] = useState({
    interviewDate: '',
    interviewTime: '',
    reason: '',
  });

  // Cancel form state
  const [cancelData, setCancelData] = useState({
    reason: '',
  });

  const { data, loading, error, refetch } = useFetch(() =>
    interviewService.getInterview(id)
  );
  const interview = data;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'interviewed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getResultColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCompleteReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!reviewData.feedback.trim()) {
        toast.error('Please provide feedback');
        return;
      }

      const response = await interviewService.completeInterview(id, reviewData);

      // Show appropriate success message based on status
      if (reviewData.status === 'accepted' && response.data?.data) {
        const { applicantName, trackName } = response.data.data;
        toast.success(`${applicantName} has been accepted into ${trackName}!`);
      } else if (reviewData.status === 'rejected') {
        toast.success(
          'Interview review completed. Applicant has been notified.'
        );
      } else {
        toast.success('Interview review completed successfully!');
      }

      refetch();
      setActiveTab('details');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to complete review');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!rescheduleData.interviewDate || !rescheduleData.interviewTime) {
        toast.error('Please provide new date and time');
        return;
      }

      const newDateTime = new Date(
        `${rescheduleData.interviewDate}T${rescheduleData.interviewTime}`
      );
      if (newDateTime < new Date()) {
        toast.error('New interview date and time must be in the future');
        return;
      }

      await interviewService.rescheduleInterview(id, rescheduleData);
      toast.success('Interview rescheduled successfully!');
      refetch();
      setActiveTab('details');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to reschedule interview'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!cancelData.reason.trim()) {
        toast.error('Please provide a reason for cancellation');
        return;
      }

      await interviewService.cancelInterview(id, cancelData);
      toast.success('Interview cancelled successfully!');
      refetch();
      setActiveTab('details');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to cancel interview'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return <Loader text='Loading interview details...' />;
  }

  if (error || !interview) {
    return (
      <div className='text-center text-red-600'>
        Interview not found or failed to load
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin', 'mentor']}>
      <div className='max-w-4xl mx-auto space-y-6'>
        {/* Header */}
        <div className='flex items-center gap-4'>
          <Link href='/lms/recruitment/interviews'>
            <Button variant='secondary' size='sm'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back to Interviews
            </Button>
          </Link>
          <div className='flex-1'>
            <h1 className='text-2xl font-bold text-gray-900'>
              Interview ({interview.application.applicant.firstName}{' '}
              {interview.application.applicant.lastName})
            </h1>
            <p className='text-gray-600'>
              Manage interview details and conduct review
            </p>
          </div>
          <div className='flex gap-2'>
            <Badge className={getStatusColor(interview.status)}>
              {interview.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className='grid w-full grid-cols-4'>
            <TabsTrigger value='details'>Details</TabsTrigger>
            <TabsTrigger
              value='review'
              disabled={interview.status !== 'scheduled'}
            >
              Complete Review
            </TabsTrigger>
            <TabsTrigger
              value='reschedule'
              disabled={interview.status !== 'scheduled'}
            >
              Reschedule
            </TabsTrigger>
            <TabsTrigger
              value='cancel'
              disabled={interview.status !== 'scheduled'}
            >
              Cancel
            </TabsTrigger>
          </TabsList>

          <TabsContent value='details'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Interview Information */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Calendar className='w-5 h-5' />
                    Interview Information
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div>
                    <Label className='text-sm font-medium text-gray-700'>
                      Date & Time
                    </Label>
                    <p className='text-sm text-gray-900'>
                      {formatDateTime(`${interview.scheduledDate}`)}
                    </p>
                  </div>

                  {interview.meetingLink && (
                    <div>
                      <Label className='text-sm font-medium text-gray-700'>
                        Meeting Link
                      </Label>
                      <div className='flex items-center gap-2'>
                        <a
                          href={interview.meetingLink}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-sm text-blue-600 hover:underline flex items-center gap-1'
                        >
                          Join Meeting <ExternalLink className='w-3 h-3' />
                        </a>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className='text-sm font-medium text-gray-700'>
                      Location
                    </Label>
                    <p className='text-sm text-gray-900'>
                      {interview.location || 'Online'}
                    </p>
                  </div>

                  <div>
                    <Label className='text-sm font-medium text-gray-700'>
                      Status
                    </Label>
                    <p className='text-sm text-gray-900 capitalize'>
                      {interview.status}
                    </p>
                  </div>

                  {interview.rating && (
                    <div>
                      <Label className='text-sm font-medium text-gray-700'>
                        Rating
                      </Label>
                      <p className='text-sm text-gray-900'>
                        ⭐ {interview.rating}
                      </p>
                    </div>
                  )}

                  {interview.application?.status &&
                    ['accepted', 'rejected'].includes(
                      interview.application.status
                    ) && (
                      <div>
                        <Label className='text-sm font-medium text-gray-700'>
                          Application Result
                        </Label>
                        <Badge
                          className={getResultColor(
                            interview.application.status
                          )}
                        >
                          {interview.application.status.toUpperCase()}
                        </Badge>
                      </div>
                    )}

                  <div>
                    <Label className='text-sm font-medium text-gray-700'>
                      Created
                    </Label>
                    <p className='text-sm text-gray-900'>
                      {formatDate(interview.createdAt)}
                    </p>
                  </div>

                  {interview.updatedAt !== interview.createdAt && (
                    <div>
                      <Label className='text-sm font-medium text-gray-700'>
                        Last Updated
                      </Label>
                      <p className='text-sm text-gray-900'>
                        {formatDate(interview.updatedAt)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Participant Information */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Users className='w-5 h-5' />
                    Participants
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {/* Applicant */}
                  <div>
                    <Label className='text-sm font-medium text-gray-700'>
                      Applicant
                    </Label>
                    <div className='mt-1 p-3 bg-gray-50 rounded-md'>
                      <p className='font-medium text-gray-900'>
                        {interview.application?.applicant?.firstName}{' '}
                        {interview.application?.applicant?.lastName}
                      </p>
                      <p className='text-sm text-gray-600'>
                        {interview.application?.applicant?.email}
                      </p>
                      {interview?.application?.track && (
                        <p className='text-sm text-gray-600'>
                          Track: {interview?.application?.track?.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Interviewer */}
                  <div>
                    <Label className='text-sm font-medium text-gray-700'>
                      Interviewer
                    </Label>
                    <div className='mt-1 p-3 bg-gray-50 rounded-md'>
                      <p className='font-medium text-gray-900'>
                        {interview.interviewer?.firstName}{' '}
                        {interview.interviewer?.lastName}
                      </p>
                      <p className='text-sm text-gray-600'>
                        {interview.interviewer?.email}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes & Feedback */}
              {(interview.notes || interview.feedback) && (
                <div className='lg:col-span-2'>
                  <Card>
                    <CardHeader>
                      <CardTitle>Notes & Feedback</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      {interview.notes && (
                        <div>
                          <Label className='text-sm font-medium text-gray-700'>
                            Initial Notes
                          </Label>
                          <div className='mt-1 p-3 bg-gray-50 rounded-md'>
                            <p className='text-sm text-gray-900'>
                              {interview.notes}
                            </p>
                          </div>
                        </div>
                      )}

                      {interview.feedback && (
                        <div>
                          <Label className='text-sm font-medium text-gray-700'>
                            Interview Feedback
                          </Label>
                          <div className='mt-1 p-3 bg-blue-50 rounded-md'>
                            <p className='text-sm text-gray-900'>
                              {interview.feedback}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value='review'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <CheckCircle className='w-5 h-5' />
                  Complete Interview Review
                </CardTitle>
                <CardDescription>
                  Provide feedback and mark the interview as completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCompleteReview} className='space-y-6'>
                  <div className='space-y-2'>
                    <Label htmlFor='feedback'>Interview Feedback</Label>
                    <Textarea
                      id='feedback'
                      value={reviewData.feedback}
                      onChange={(e) =>
                        setReviewData((prev) => ({
                          ...prev,
                          feedback: e.target.value,
                        }))
                      }
                      placeholder='Provide detailed feedback about the interview...'
                      rows={4}
                    />
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='status'>
                        Interview Decision{' '}
                        <span className='text-red-500'>*</span>
                      </Label>
                      <select
                        id='status'
                        value={reviewData.status}
                        required
                        onChange={(e) =>
                          setReviewData((prev) => ({
                            ...prev,
                            status: e.target.value as 'accepted' | 'rejected',
                          }))
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      >
                        <option value='accepted'>
                          Accept (Promote to Student)
                        </option>
                        <option value='rejected'>Reject</option>
                      </select>
                      {reviewData.status === 'accepted' && (
                        <p className='text-xs text-green-600'>
                          This applicant will be promoted to student role and
                          granted access to the program.
                        </p>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='rating'>Rating (1-5)</Label>
                      <Input
                        id='rating'
                        type='number'
                        min='1'
                        max='5'
                        value={reviewData.rating}
                        onChange={(e) =>
                          setReviewData((prev) => ({
                            ...prev,
                            rating: parseInt(e.target.value),
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='reviewNotes'>
                      Additional Notes (Optional)
                    </Label>
                    <Textarea
                      id='reviewNotes'
                      value={reviewData.notes}
                      onChange={(e) =>
                        setReviewData((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      placeholder='Any additional notes or observations...'
                      rows={3}
                    />
                  </div>

                  <div className='flex gap-3'>
                    <Button type='submit' disabled={isLoading}>
                      {isLoading ? 'Completing Review...' : 'Complete Review'}
                    </Button>
                    <Button
                      type='button'
                      variant='secondary'
                      onClick={() => setActiveTab('details')}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='reschedule'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <RotateCcw className='w-5 h-5' />
                  Reschedule Interview
                </CardTitle>
                <CardDescription>
                  Change the interview date and time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleReschedule} className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='newDate'>
                        New Date <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        id='newDate'
                        type='date'
                        value={rescheduleData.interviewDate}
                        onChange={(e) =>
                          setRescheduleData((prev) => ({
                            ...prev,
                            interviewDate: e.target.value,
                          }))
                        }
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='newTime'>
                        New Time <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        id='newTime'
                        type='time'
                        value={rescheduleData.interviewTime}
                        onChange={(e) =>
                          setRescheduleData((prev) => ({
                            ...prev,
                            interviewTime: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='rescheduleReason'>
                      Reason for Rescheduling (Optional)
                    </Label>
                    <Textarea
                      id='rescheduleReason'
                      value={rescheduleData.reason}
                      onChange={(e) =>
                        setRescheduleData((prev) => ({
                          ...prev,
                          reason: e.target.value,
                        }))
                      }
                      placeholder='Explain why the interview is being rescheduled...'
                      rows={3}
                    />
                  </div>

                  <div className='flex gap-3'>
                    <Button type='submit' disabled={isLoading}>
                      {isLoading ? 'Rescheduling...' : 'Reschedule Interview'}
                    </Button>
                    <Button
                      type='button'
                      variant='secondary'
                      onClick={() => setActiveTab('details')}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='cancel'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <XCircle className='w-5 h-5' />
                  Cancel Interview
                </CardTitle>
                <CardDescription>
                  Cancel this interview permanently
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCancel} className='space-y-6'>
                  <div className='space-y-2'>
                    <Label htmlFor='cancelReason'>
                      Reason for Cancellation{' '}
                      <span className='text-red-500'>*</span>
                    </Label>
                    <Textarea
                      id='cancelReason'
                      value={cancelData.reason}
                      onChange={(e) =>
                        setCancelData((prev) => ({
                          ...prev,
                          reason: e.target.value,
                        }))
                      }
                      placeholder='Explain why the interview is being cancelled...'
                      rows={4}
                      required
                    />
                  </div>

                  <div className='p-4 bg-red-50 rounded-md'>
                    <p className='text-sm text-red-800'>
                      <strong>Warning:</strong> Cancelling this interview will
                      permanently change its status. Both the applicant and
                      interviewer will be notified of the cancellation.
                    </p>
                  </div>

                  <div className='flex gap-3'>
                    <Button
                      type='submit'
                      variant='destructive'
                      disabled={isLoading}
                    >
                      {isLoading ? 'Cancelling...' : 'Cancel Interview'}
                    </Button>
                    <Button
                      type='button'
                      variant='secondary'
                      onClick={() => setActiveTab('details')}
                    >
                      Keep Interview
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  );
}
