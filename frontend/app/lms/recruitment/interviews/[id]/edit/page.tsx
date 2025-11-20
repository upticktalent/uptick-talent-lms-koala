'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { interviewService } from '@/services/interviewService';
import { RoleGuard } from '@/middleware/roleGuard';
import {
  ArrowLeft,
  Save,
  Calendar,
  Clock,
  MapPin,
  Link as LinkIcon,
} from 'lucide-react';
import Link from 'next/link';
import Loader from '@/components/Loader';

export default function EditInterviewPage() {
  const router = useRouter();
  const params = useParams();
  const interviewId = params.id as string;

  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    duration: 30,
    location: '',
    meetingLink: '',
    notes: '',
    interviewType: '',
  });

  useEffect(() => {
    fetchInterview();
  }, [interviewId]);

  const fetchInterview = async () => {
    try {
      setLoading(true);
      const response = await interviewService.getInterviewDetails(interviewId);

      if (response.data.success) {
        const interviewData = response.data.data;
        setInterview(interviewData);

        // Parse the scheduled date and time
        const scheduledDate = new Date(interviewData.scheduledDate);
        const dateStr = scheduledDate.toISOString().split('T')[0];
        const timeStr = scheduledDate.toTimeString().slice(0, 5);

        setFormData({
          scheduledDate: dateStr,
          scheduledTime: timeStr,
          duration: interviewData.duration || 30,
          location: interviewData.location || '',
          meetingLink: interviewData.meetingLink || '',
          notes: interviewData.notes || '',
          interviewType: interviewData.interviewType || '',
        });
      } else {
        setError('Failed to fetch interview details');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to fetch interview details'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.scheduledDate || !formData.scheduledTime) {
      setError('Date and time are required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Combine date and time
      const scheduledDateTime = new Date(
        `${formData.scheduledDate}T${formData.scheduledTime}`
      );

      const updateData = {
        scheduledDate: scheduledDateTime.toISOString(),
        duration: formData.duration,
        location: formData.location,
        meetingLink: formData.meetingLink,
        notes: formData.notes,
        interviewType: formData.interviewType,
      };

      const response = await interviewService.updateInterview(
        interviewId,
        updateData
      );

      if (response.data.success) {
        router.push('/lms/recruitment/interviews');
      } else {
        setError(response.data.message || 'Failed to update interview');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update interview');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader text='Loading interview details...' />;
  }

  if (error && !interview) {
    return (
      <div className='text-center text-red-600'>
        Failed to load interview: {error}
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin', 'mentor']}>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center gap-4'>
          <Link href='/lms/recruitment/interviews'>
            <Button variant='ghost' size='sm'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back to Interviews
            </Button>
          </Link>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Edit Interview</h1>
            <p className='text-gray-600'>
              Update interview details for{' '}
              {interview?.application?.applicant?.firstName}{' '}
              {interview?.application?.applicant?.lastName}
            </p>
          </div>
        </div>

        {/* Interview Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Interview Information</CardTitle>
            <CardDescription>
              Track: {interview?.application?.track?.name} | Interviewer:{' '}
              {interview?.interviewer?.firstName}{' '}
              {interview?.interviewer?.lastName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-6'>
              {error && (
                <div className='p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm'>
                  {error}
                </div>
              )}

              {/* Date and Time */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label
                    htmlFor='scheduledDate'
                    className='flex items-center gap-2'
                  >
                    <Calendar className='w-4 h-4' />
                    Interview Date
                  </Label>
                  <Input
                    id='scheduledDate'
                    type='date'
                    value={formData.scheduledDate}
                    onChange={(e) =>
                      handleInputChange('scheduledDate', e.target.value)
                    }
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label
                    htmlFor='scheduledTime'
                    className='flex items-center gap-2'
                  >
                    <Clock className='w-4 h-4' />
                    Interview Time
                  </Label>
                  <Input
                    id='scheduledTime'
                    type='time'
                    value={formData.scheduledTime}
                    onChange={(e) =>
                      handleInputChange('scheduledTime', e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              {/* Duration and Type */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='duration'>Duration (minutes)</Label>
                  <Input
                    id='duration'
                    type='number'
                    min='15'
                    max='180'
                    step='15'
                    value={formData.duration}
                    onChange={(e) =>
                      handleInputChange('duration', parseInt(e.target.value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor='interviewType'>Interview Type</Label>
                  <select
                    id='interviewType'
                    value={formData.interviewType}
                    onChange={(e) =>
                      handleInputChange('interviewType', e.target.value)
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  >
                    <option value=''>Select Type</option>
                    <option value='technical'>Technical</option>
                    <option value='behavioral'>Behavioral</option>
                    <option value='screening'>Screening</option>
                    <option value='final'>Final Round</option>
                  </select>
                </div>
              </div>

              {/* Location and Meeting Link */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='location' className='flex items-center gap-2'>
                    <MapPin className='w-4 h-4' />
                    Location
                  </Label>
                  <Input
                    id='location'
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange('location', e.target.value)
                    }
                    placeholder='Online, Conference Room A, etc.'
                  />
                </div>
                <div>
                  <Label
                    htmlFor='meetingLink'
                    className='flex items-center gap-2'
                  >
                    <LinkIcon className='w-4 h-4' />
                    Meeting Link
                  </Label>
                  <Input
                    id='meetingLink'
                    type='url'
                    value={formData.meetingLink}
                    onChange={(e) =>
                      handleInputChange('meetingLink', e.target.value)
                    }
                    placeholder='https://zoom.us/j/...'
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor='notes'>Notes</Label>
                <Textarea
                  id='notes'
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder='Additional notes or instructions...'
                  rows={4}
                />
              </div>

              {/* Actions */}
              <div className='flex gap-3 pt-4'>
                <Button type='submit' disabled={saving}>
                  {saving ? (
                    <>
                      <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className='w-4 h-4 mr-2' />
                      Update Interview
                    </>
                  )}
                </Button>
                <Link href='/lms/recruitment/interviews'>
                  <Button type='button' variant='secondary' disabled={saving}>
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
