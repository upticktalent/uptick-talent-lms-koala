'use client';

import { useState } from 'react';
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
import { interviewService } from '@/services/interviewService';
import { Calendar, Clock, User, CheckCircle } from 'lucide-react';
import { formatDate, formatTime } from '@/utils/formatDate';
import Loader from '@/components/Loader';

export default function PublicSchedulePage() {
  const [step, setStep] = useState<'verify' | 'schedule' | 'success'>('verify');
  const [applicationId, setApplicationId] = useState('');
  const [application, setApplication] = useState<any>(null);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scheduledInterview, setScheduledInterview] = useState<any>(null);

  const verifyApplication = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!applicationId.trim()) {
      setError('Please enter your application ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get application details and check if it's eligible for interview
      const response = await interviewService.getInterviewByApplication(
        applicationId
      );

      if (response.data.success && response.data.data) {
        // Interview already exists
        setError(
          'You already have an interview scheduled for this application.'
        );
        return;
      }

      // If no interview exists, we need to verify the application exists and is eligible
      // For now, let's assume the application is valid and fetch available slots
      const slotsResponse = await interviewService.getAvailableSlots();

      if (slotsResponse.data.success) {
        setAvailableSlots(slotsResponse.data.data?.slotsByDate || {});
        setApplication({ id: applicationId }); // Mock application data
        setStep('schedule');
      } else {
        setError('No available interview slots found.');
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        // No interview found, which is good - fetch available slots
        try {
          const slotsResponse = await interviewService.getAvailableSlots();
          if (slotsResponse.data.success) {
            setAvailableSlots(slotsResponse.data.data?.slotsByDate || {});
            setApplication({ id: applicationId });
            setStep('schedule');
          } else {
            setError('No available interview slots found.');
          }
        } catch (slotsError) {
          setError('Failed to load available slots. Please try again.');
        }
      } else {
        setError(
          err.response?.data?.message ||
            'Invalid application ID or application not found.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const scheduleInterview = async () => {
    if (!selectedSlot) {
      setError('Please select an interview slot');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await interviewService.scheduleInterview({
        applicationId: applicationId,
        slotId: selectedSlot,
      });

      if (response.data.success) {
        setScheduledInterview(response.data.data);
        setStep('success');
      } else {
        setError(response.data.message || 'Failed to schedule interview');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Failed to schedule interview. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderVerificationStep = () => (
    <Card className='max-w-md mx-auto'>
      <CardHeader className='text-center'>
        <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <User className='w-8 h-8 text-blue-600' />
        </div>
        <CardTitle>Schedule Your Interview</CardTitle>
        <CardDescription>
          Enter your application ID to begin scheduling your interview
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={verifyApplication} className='space-y-4'>
          <div>
            <Label htmlFor='applicationId'>Application ID</Label>
            <Input
              id='applicationId'
              type='text'
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              placeholder='Enter your application ID'
              required
            />
            <p className='text-sm text-gray-500 mt-1'>
              You should have received this ID via email when you submitted your
              application.
            </p>
          </div>

          {error && (
            <div className='p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm'>
              {error}
            </div>
          )}

          <Button type='submit' className='w-full' disabled={loading}>
            {loading ? (
              <>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
                Verifying...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  const renderScheduleStep = () => (
    <div className='max-w-4xl mx-auto'>
      <div className='text-center mb-8'>
        <h1 className='text-2xl font-bold text-gray-900'>
          Select Interview Slot
        </h1>
        <p className='text-gray-600'>
          Choose a convenient time for your interview
        </p>
      </div>

      {Object.keys(availableSlots).length === 0 ? (
        <Card>
          <CardContent className='pt-6 text-center'>
            <Calendar className='w-12 h-12 mx-auto mb-4 text-gray-300' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              No Available Slots
            </h3>
            <p className='text-gray-500'>
              No interview slots are currently available. Please check back
              later.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-6'>
          {Object.entries(availableSlots).map(
            ([date, slots]: [string, any]) => (
              <Card key={date}>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Calendar className='w-5 h-5' />
                    {formatDate(date)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {slots.map((slot: any) => (
                      <button
                        key={slot._id}
                        onClick={() => setSelectedSlot(slot._id)}
                        className={`p-4 border rounded-lg text-left transition-colors ${
                          selectedSlot === slot._id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className='flex items-center gap-2 mb-2'>
                          <Clock className='w-4 h-4 text-gray-500' />
                          <span className='font-medium'>
                            {formatTime(slot.startTime)} -{' '}
                            {formatTime(slot.endTime)}
                          </span>
                        </div>
                        <p className='text-sm text-gray-600'>
                          Interviewer: {slot.interviewer?.firstName}{' '}
                          {slot.interviewer?.lastName}
                        </p>
                        <p className='text-sm text-gray-500'>
                          Duration: {slot.duration} minutes
                        </p>
                        <p className='text-sm text-gray-500'>
                          Location: {slot.location}
                        </p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          )}

          {error && (
            <div className='p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm'>
              {error}
            </div>
          )}

          <div className='flex gap-4 justify-center'>
            <Button
              variant='secondary'
              onClick={() => {
                setStep('verify');
                setError(null);
              }}
            >
              Back
            </Button>
            <Button
              onClick={scheduleInterview}
              disabled={!selectedSlot || loading}
            >
              {loading ? (
                <>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
                  Scheduling...
                </>
              ) : (
                'Schedule Interview'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const renderSuccessStep = () => (
    <Card className='max-w-md mx-auto'>
      <CardHeader className='text-center'>
        <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <CheckCircle className='w-8 h-8 text-green-600' />
        </div>
        <CardTitle className='text-green-600'>Interview Scheduled!</CardTitle>
        <CardDescription>
          Your interview has been successfully scheduled
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {scheduledInterview && (
          <div className='bg-gray-50 p-4 rounded-lg space-y-2'>
            <div className='flex items-center gap-2'>
              <Calendar className='w-4 h-4 text-gray-500' />
              <span className='font-medium'>
                {formatDate(scheduledInterview.scheduledDate)}
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <Clock className='w-4 h-4 text-gray-500' />
              <span>Duration: {scheduledInterview.duration} minutes</span>
            </div>
            <div className='flex items-center gap-2'>
              <User className='w-4 h-4 text-gray-500' />
              <span>
                Interviewer: {scheduledInterview.interviewer?.firstName}{' '}
                {scheduledInterview.interviewer?.lastName}
              </span>
            </div>
          </div>
        )}

        <div className='text-sm text-gray-600 space-y-2'>
          <p>
            ✅ Confirmation email has been sent to your registered email address
          </p>
          <p>✅ Calendar invite has been included with meeting details</p>
          <p>✅ You can reschedule or cancel if needed by contacting us</p>
        </div>

        <Button
          variant='secondary'
          className='w-full'
          onClick={() => window.close()}
        >
          Close
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className='min-h-screen bg-gray-50 py-12'>
      <div className='container mx-auto px-4'>
        {step === 'verify' && renderVerificationStep()}
        {step === 'schedule' && renderScheduleStep()}
        {step === 'success' && renderSuccessStep()}
      </div>
    </div>
  );
}
